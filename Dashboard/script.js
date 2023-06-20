document.addEventListener("DOMContentLoaded", function () {
  var dimensionInput = document.getElementById("dimensionInput");
  var codigoProduccionInput = document.getElementById("codigoProduccionInput");

  var chartContainer = document.getElementById("chart");
  var chart = null;
  var donutContainer = document.getElementById("donutChart");
  var donutChart = null;

  fetch(
    "https://script.google.com/macros/s/AKfycbzbgSuF26Rykv2W0_GJC8o-EOETkOLf4PXBOuu9Zv6yu_Pv8gyYv7HmCpLVCsKRcxli/exec"
  )
    .then((response) => response.json())
    .then((data) => {
      var dimensiones = [];
      var codigosProduccion = {};

      data.forEach((row) => {
        var dimension = row.dimensiones;
        var codigoProduccion = row["codigo de produccion"];

        if (!dimensiones.includes(dimension)) {
          dimensiones.push(dimension);
        }

        if (!codigosProduccion[dimension]) {
          codigosProduccion[dimension] = [];
        }

        if (!codigosProduccion[dimension].includes(codigoProduccion)) {
          codigosProduccion[dimension].push(codigoProduccion);
        }
      });

      dimensiones.forEach((dimension) => {
        var option = document.createElement("option");
        option.value = dimension;
        document.getElementById("dimensiones").appendChild(option);
      });

      dimensionInput.addEventListener("input", function () {
        var selectedDimension = dimensionInput.value;
        codigoProduccionInput.innerHTML = "";

        if (codigosProduccion[selectedDimension]) {
          codigosProduccion[selectedDimension].forEach((codigoProduccion) => {
            var option = document.createElement("option");
            option.value = codigoProduccion;
            document.getElementById("codigosProduccion").appendChild(option);
          });
        }
      });

      codigoProduccionInput.addEventListener("input", function () {
        var selectedCodigoProduccion = codigoProduccionInput.value;

        fetch(
          "https://script.googleusercontent.com/macros/echo?user_content_key=tuU2Cy5yHXXNMI8V_dYlCmAZQLqA26buW8yQ8-nFk0vbWKnLpxt45Jd1uBDHSVB6V1SHNnUOs3x4Q8aA66LNRrGLWFpGs-FAm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnMj_NyiF7qrL5vVxVSITYzbD9p28LFDcYZsn4QNG37U2-FRHvgah6IU6w2ghli4IiISxmFlpaqMTkDN9FHnJFTXem0jtBAG9qQ&lib=MMWuKL-eOHMmoIv7bvBKFFjOmqOjcdjRL"
        )
          .then((response) => response.json())
          .then((data) => {
            var filteredData = data.filter(
              (row) => row.Orden === selectedCodigoProduccion
            );
            var cantidadBobinas = filteredData.length;

            var pesoTotalExtruido = filteredData.reduce((total, row) => {
              var pesoBobina = parseFloat(row["Peso Kg"]) || 0;
              var desperdicio = parseFloat(row["Kg residuo"]) || 0;
              var kgRechazados = parseFloat(row["Kg rechazados"]) || 0;
              return total + pesoBobina + desperdicio + kgRechazados;
            }, 0);

            var cantidadDesperdicio = filteredData.reduce((total, row) => {
              var desperdicio = parseFloat(row["Kg residuo"]) || 0;
              return total + desperdicio;
            }, 0);

            var cantidadKgRechazados = filteredData.reduce((total, row) => {
              var kgRechazados = parseFloat(row["Kg rechazados"]) || 0;
              return total + kgRechazados;
            }, 0);

            document.getElementById("pesoTotalExtruido").textContent =
              pesoTotalExtruido.toFixed(2);
            document.getElementById("cantidadDesperdicio").textContent =
              cantidadDesperdicio.toFixed(2);
            document.getElementById("cantidadKgRechazados").textContent =
              cantidadKgRechazados.toFixed(2);

            if (chart !== null) {
              chart.destroy();
            }

            var bobinas = filteredData.map((row) => ({
              numero: row["N° de bobina"],
              peso: row["Peso Kg"],
              pesoRechazado: row["Kg rechazados"],
            }));

            chart = new Chart(chartContainer, {
              type: "bar",
              data: {
                labels: bobinas.map((bobina) => bobina.numero),
                datasets: [
                  {
                    label: "Bobinas",
                    data: bobinas.map((bobina) => bobina.peso),
                    backgroundColor: "#38761d",
                  },
                  {
                    label: "Peso Rechazado",
                    data: bobinas.map((bobina) => bobina.pesoRechazado),
                    backgroundColor: "rgba(255, 99, 132, 1)",
                  },
                ],
              },
              options: {
                responsive: true,

                scales: {
                  xAxes: [
                    {
                      gridLines: {
                        display: false,
                      },
                    },
                  ],
                  yAxes: [
                    {
                      gridLines: {
                        display: false,
                      },
                      beginAtZero: true,
                      ticks: {
                        precision: 0,
                      },
                    },
                  ],
                },
              },
            });

            var groupedByDate = filteredData.reduce((result, row) => {
              var fecha = new Date(row.Fecha);
              var dia = fecha.getDate();
              var mes = fecha.getMonth() + 1;
              var año = fecha.getFullYear();
              var fechaFormateada = dia + "/" + mes + "/" + año;

              var pesoBobina = parseFloat(row["Peso Kg"]) || 0;
              var desperdicio = parseFloat(row["Kg residuo"]) || 0;
              var kgRechazados = parseFloat(row["Kg rechazados"]) || 0;
              var kgExtruidos = pesoBobina + desperdicio + kgRechazados;

              if (!result[fechaFormateada]) {
                result[fechaFormateada] = 0;
              }

              result[fechaFormateada] += kgExtruidos;

              return result;
            }, {});

            var donutLabels = Object.keys(groupedByDate);
            var donutData = Object.values(groupedByDate);

            if (donutChart !== null) {
              donutChart.destroy();
            }

            donutChart = new Chart(donutContainer, {
              type: "doughnut",
              data: {
                labels: donutLabels,
                datasets: [
                  {
                    label: "Kg Extruidos por Día",
                    data: donutData,
                    backgroundColor: [
                      "#38761d",
                      "#31621b",
                      "#294e18",
                      "#213b15",
                      "#192911",
                      "#11180a",
                      "#000000",
                    ],
                  },
                ],
              },
              options: {
                responsive: true,
              },
            });
            // Filtrar los datos por código de producción seleccionado
            var filteredDataExtrusion = data.filter(
              (row) => row.Orden === selectedCodigoProduccion
            );

            // Mostrar los datos filtrados en una tabla
            showExtrusionData(filteredDataExtrusion);
            function showExtrusionData(data) {
              tablaDatosExtrusion.innerHTML = "";

              if (data.length === 0) {
                tablaDatosExtrusion.textContent =
                  "No se encontraron datos de extrusión para la orden de producción seleccionada.";
                return;
              }

              // Agrupar los datos por Fecha, Turno y Operador y sumar los valores correspondientes
              var groupedData = groupAndSumData(data);

              var table = document.createElement("table");
              table.classList.add(
                "table",
                "w-full",
                "text-center",
                "text-gray-500"
              );

              var thead = document.createElement("thead");
              thead.classList.add(
                "text-xs",
                "text-gray-700",
                "uppercase",
                "bg-gray-50"
              );

              var tbody = document.createElement("tbody");

              var headers = [
                "Fecha",
                "Turno",
                "Operador",
                "Peso Kg",
                "Kg residuo",
                "Kg rechazados",
              ];
              var headerRow = document.createElement("tr");

              headers.forEach((headerText) => {
                var th = document.createElement("th");
                th.setAttribute("scope", "col");
                th.classList.add("px-6", "py-3");
                th.textContent = headerText;
                headerRow.appendChild(th);
              });

              thead.appendChild(headerRow);
              table.appendChild(thead);

              groupedData.forEach((group, index) => {
                var rowElement = document.createElement("tr");

                var fecha = new Date(group.Fecha).toLocaleDateString("es-ES");
                var turno = group.Turno;
                var operador = group.Operador;
                var pesoKg = group.totalPesoKg.toFixed(2); // Limitar a 2 decimales
                var kgResiduo = group.totalKgResiduo.toFixed(2); // Limitar a 2 decimales
                var kgRechazados = group.totalKgRechazados.toFixed(2); // Limitar a 2 decimales

                var rowData = [
                  fecha,
                  turno,
                  operador,
                  pesoKg,
                  kgResiduo,
                  kgRechazados,
                ];

                rowData.forEach((cellData) => {
                  var cell = document.createElement("td");
                  cell.classList.add("px-6", "py-4");
                  cell.textContent = cellData;
                  rowElement.appendChild(cell);
                });

                // Aplicar colores alternos a las filas
                if (index % 2 === 0) {
                  rowElement.classList.add("bg-white");
                } else {
                  rowElement.classList.add("bg-gray-50");
                }

                tbody.appendChild(rowElement);
              });

              table.appendChild(tbody);
              tablaDatosExtrusion.appendChild(table);
            }

            function groupAndSumData(data) {
              var groupedData = [];

              data.forEach((row) => {
                var existingGroup = groupedData.find(
                  (group) =>
                    group.Fecha === row.Fecha &&
                    group.Turno === row.Turno &&
                    group.Operador === row.Operador
                );

                if (existingGroup) {
                  existingGroup.totalPesoKg += row["Peso Kg"];
                  existingGroup.totalKgResiduo += row["Kg residuo"];
                  existingGroup.totalKgRechazados += row["Kg rechazados"];
                } else {
                  var newGroup = {
                    Fecha: row.Fecha,
                    Turno: row.Turno,
                    Operador: row.Operador,
                    totalPesoKg: row["Peso Kg"],
                    totalKgResiduo: row["Kg residuo"],
                    totalKgRechazados: row["Kg rechazados"],
                  };
                  groupedData.push(newGroup);
                }
              });

              return groupedData;
            }
          })
          .catch((error) => {
            console.error("Error al obtener los datos de la API:", error);
          });
      });
    })
    .catch((error) => {
      console.error("Error al obtener los datos de la API:", error);
    });
});
