fetch('https://script.googleusercontent.com/macros/echo?user_content_key=v05E1NWa0ZWqeGanXMrwZyTUU3i5CT6hRuGuGrRvLYz0gOwYK3C0hAppkEMZ_8bboH0l4uv7Qjuo4BZ6qlamuCKUlW_SvkBWm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnLz1Dv_FNBfc_5jNgO8_ZAZFqhraXSS5dFrMmg-hfwKCDQrxwLvx3NkHzurZvadrn2WsoidffnzLKICXSF4H218HNTbpFbvC0tz9Jw9Md8uu&lib=MYymAgC-uVInhBZBppwAz1TAiWzWr-kvc')
  .then(response => response.json())
  .then(data => {
    console.log('Datos de la API:', data);
    renderizarTabla(data);
  })
  .catch(error => {
    console.error('Error al obtener los datos de la API:', error);
  });

  function renderizarTabla(datos) {
    const tablaEncabezados = document.getElementById('tabla-encabezados');
    const tablaDatos = document.getElementById('tabla-datos');
  
    // Generar los encabezados de columna en base a las propiedades de los datos
    const encabezados = Object.keys(datos[0]);
    encabezados.forEach(encabezado => {
      const th = document.createElement('th');
      th.classList.add('px-6', 'py-3', 'text-center', 'text-xs', 'font-medium', 'text-gray-500', 'uppercase', 'tracking-wider');
      th.textContent = encabezado;
      tablaEncabezados.appendChild(th);
    });
  
    // Recorrer los datos y crear las filas de la tabla
    datos.forEach(item => {
      const fila = document.createElement('tr');
  
      for (const key in item) {
        const columna = document.createElement('td');
        columna.classList.add('px-6', 'py-4', 'whitespace-nowrap');
  
        if (key === 'fecha') {
          const fecha = new Date(item[key]);
          const dia = fecha.getDate().toString().padStart(2, '0');
          const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
          const anio = fecha.getFullYear();
          columna.textContent = `${dia}/${mes}/${anio}`;
        } else {
          columna.textContent = item[key];
        }
  
        fila.appendChild(columna);
      }
  
      tablaDatos.appendChild(fila);
    });
  }
  