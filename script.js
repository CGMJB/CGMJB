// Notion API配置
const NOTION_API_KEY = 'secret_ntn_6452153753858VLROFsS4XVRsD4zbZ9ZERDCmSrVBJi2a4';
const DATABASE_ID = '22bf05c8880280afb387cdb7b7f2779322bf05c8880280238b32000c48f4173c';

// 获取Notion数据
async function fetchNotionData() {
  const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
}

// 渲染总排名
function renderLeaderboard(data) {
  const tableBody = document.querySelector('#ranking-table tbody');
  tableBody.innerHTML = '';
  
  // 按积分排序
  const sortedData = data.results
    .map(item => ({
      name: item.properties['选手名称'].title[0]?.plain_text || '未知',
      role: item.properties['角色'].select?.name || '',
      matches: item.properties['场次'].number || 0,
      points: item.properties['积分'].number || 0
    }))
    .sort((a, b) => b.points - a.points);
  
  // 填充表格
  sortedData.forEach((player, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${player.name}</td>
      <td>${player.role}</td>
      <td>${player.matches}</td>
      <td>${player.points}</td>
    `;
    tableBody.appendChild(row);
  });
}

// 渲染详细数据
function renderPlayerDetails(player) {
  const container = document.getElementById('result-container');
  const title = document.getElementById('result-title');
  const table = document.getElementById('detail-table');
  
  title.textContent = `${player.name} (${player.role}) 数据详情`;
  table.innerHTML = '';
  
  const commonFields = [
    { name: '场均演绎得分', value: player['场均演绎得分'] }
  ];
  
  const hunterFields = [
    { name: '场均破坏板子', value: player['场均破坏板子'] },
    { name: '场均击倒', value: player['场均击倒'] },
    { name: '场均淘汰', value: player['场均淘汰'] },
    { name: '场均恐惧震慑', value: player['场均恐惧震慑'] },
    { name: '局均剩余密码机', value: player['局均剩余密码机'] }
  ];
  
  const survivorFields = [
    { name: '场均破译进度', value: player['场均破译进度'] },
    { name: '局均板子命中', value: player['局均板子命中'] },
    { name: '局均救人', value: player['局均救人'] },
    { name: '局均治疗', value: player['局均治疗'] },
    { name: '局均牵制监管者', value: player['局均牵制监管者'] }
  ];
  
  // 创建表头
  const headerRow = document.createElement('tr');
  headerRow.innerHTML = '<th>数据项</th><th>数值</th>';
  table.appendChild(headerRow);
  
  // 添加公共数据
  commonFields.forEach(field => {
    addTableRow(table, field.name, field.value);
  });
  
  // 添加角色专属数据
  if (player.role === '监管者') {
    hunterFields.forEach(field => {
      addTableRow(table, field.name, field.value);
    });
  } else {
    survivorFields.forEach(field => {
      addTableRow(table, field.name, field.value);
    });
  }
  
  container.classList.remove('hidden');
}

function addTableRow(table, name, value) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${name}</td>
    <td>${value || '-'}</td>
  `;
  table.appendChild(row);
}

// 初始化页面
async function initPage() {
  try {
    const data = await fetchNotionData();
    renderLeaderboard(data);
    
    // 设置表单提交事件
    document.getElementById('player-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const playerName = document.getElementById('player-name').value.trim();
      
      if (playerName) {
        const player = data.results.find(item => 
          item.properties['选手名称'].title[0]?.plain_text === playerName
        );
        
        if (player) {
          const playerData = {
            name: playerName,
            role: player.properties['角色'].select?.name || '',
            ...Object.fromEntries(
              Object.entries(player.properties)
                .filter(([key]) => key !== '选手名称' && key !== '角色')
                .map(([key, value]) => [key, value.number])
          };
          
          renderPlayerDetails(playerData);
        } else {
          alert('未找到该选手数据');
        }
      }
    });
    
  } catch (error) {
    console.error('数据加载失败:', error);
    alert('数据加载失败，请刷新重试');
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initPage);
