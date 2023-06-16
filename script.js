document.addEventListener('DOMContentLoaded', function() {
  var apiUrl = 'https://script.google.com/macros/s/AKfycby8BykpD-xBJ8kI_BxqxU-ZCtKa7ovb9GA4b6DKiBm86gYVE_mlLpbN-Gv8vmqj_BWsfQ/exec';
  var tableContainer = document.getElementById('table-container');

  // Cargar y mostrar los datos de la tabla
  function loadTable() {
    fetch(apiUrl + '?action=getExtrusionData')
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        var table = createTable(data);
        tableContainer.appendChild(table);
      })
      .catch(function(error) {
        console.log('Error:', error);
      });
  }

  // Crear la tabla a partir de los datos recibidos
  function createTable(data) {
    var table = document.createElement('table');

    // Crea la fila de encabezado
    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');
    for (var key in data[0]) {
      var th = document.createElement('th');
      th.textContent = key;
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Crea las filas de datos
    var tbody = document.createElement('tbody');
    data.forEach(function(rowData) {
      var row = document.createElement('tr');

      for (var key in rowData) {
        var cell = document.createElement('td');
        cell.textContent = rowData[key];
        row.appendChild(cell);
      }

      var editCell = document.createElement('td');
      var editButton = document.createElement('button');
      editButton.textContent = 'Editar';
      editButton.classList.add('edit-button');
      editButton.addEventListener('click', function() {
        enableEditMode(row);
      });
      editCell.appendChild(editButton);
      row.appendChild(editCell);

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    return table;
  }

  // Habilitar el modo de edición para una fila
  function enableEditMode(row) {
    row.querySelectorAll('td:not(:last-child)').forEach(function(cell) {
      var value = cell.textContent;
      cell.innerHTML = '<input type="text" value="' + value + '">';
    });

    var editButton = row.querySelector('.edit-button');
    editButton.disabled = true;

    var saveButton = document.createElement('button');
    saveButton.textContent = 'Guardar';
    saveButton.classList.add('save-button');
    saveButton.addEventListener('click', function() {
      saveChanges(row);
    });

    var saveCell = document.createElement('td');
    saveCell.appendChild(saveButton);
    row.appendChild(saveCell);
  }

  // Guardar los cambios realizados en una fila
  function saveChanges(row) {
    var inputs = row.querySelectorAll('input');
    var rowData = {};

    inputs.forEach(function(input, index) {
      var key = row.parentElement.querySelector('th:nth-child(' + (index + 1) + ')').textContent;
      var value = input.value;
      rowData[key] = value;
    });

    fetch(apiUrl + '?action=updateExtrusionData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([rowData])
    })
      .then(function(response) {
        return response.text();
      })
      .then(function(data) {
        console.log('Data updated successfully:', data);
        disableEditMode(row);
      })
      .catch(function(error) {
        console.log('Error:', error);
      });
  }

  // Deshabilitar el modo de edición para una fila
  function disableEditMode(row) {
    row.querySelectorAll('td:not(:last-child)').forEach(function(cell) {
      var input = cell.querySelector('input');
      var value = input.value;
      cell.textContent = value;
    });

    var saveCell = row.querySelector('td:last-child');
    row.removeChild(saveCell);

    var editButton = row.querySelector('.edit-button');
    editButton.disabled = false;
  }

  // Cargar la tabla al cargar la página
  loadTable();
});
