document.addEventListener('DOMContentLoaded', function() {
  fetch('https://script.google.com/macros/s/AKfycby8BykpD-xBJ8kI_BxqxU-ZCtKa7ovb9GA4b6DKiBm86gYVE_mlLpbN-Gv8vmqj_BWsfQ/exec?action=getExtrusionData')
    .then(response => response.json())
    .then(data => {
      renderTable(data);
    });

  function renderTable(data) {
    const table = document.getElementById('extrusionTable');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');

    // Generar encabezados de la tabla
    const headers = Object.keys(data[0]);
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Generar filas de la tabla
    data.forEach(rowData => {
      const row = document.createElement('tr');
      headers.forEach(header => {
        const cell = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'text';
        input.value = rowData[header];
        input.addEventListener('input', function() {
          rowData[header] = this.value;
        });
        cell.appendChild(input);
        row.appendChild(cell);
      });
      tbody.appendChild(row);
    });
  }

  function updateData() {
    const table = document.getElementById('extrusionTable');
    const rows = table.querySelectorAll('tbody tr');

    const updatedData = Array.from(rows).map(row => {
      const inputs = row.querySelectorAll('input');
      const rowData = {};

      inputs.forEach(input => {
        const header = input.parentNode.parentNode.querySelector('thead th').textContent;
        rowData[header] = input.value;
      });

      return rowData;
    });

    const postData = JSON.stringify(updatedData);

    fetch('https://script.google.com/macros/s/AKfycby8BykpD-xBJ8kI_BxqxU-ZCtKa7ovb9GA4b6DKiBm86gYVE_mlLpbN-Gv8vmqj_BWsfQ/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: postData
    })
    .then(response => {
      console.log('Data updated successfully');
    })
    .catch(error => {
      console.error('Error updating data:', error);
    });
  }

  // Agregar evento al botón de guardar
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Guardar';
  saveButton.addEventListener('click', updateData);
  document.body.appendChild(saveButton);
});
