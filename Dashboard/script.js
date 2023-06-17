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
                    backgroundColor: "rgba(54, 162, 235, 0.5)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1,
                  },
                  {
                    label: "Peso Rechazado",
                    data: bobinas.map((bobina) => bobina.pesoRechazado),
                    backgroundColor: "rgba(255, 99, 132, 0.5)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1,
                  },
                ],
              },
              options: {
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0,
                    },
                  },
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
                      "rgba(255, 99, 132, 0.5)",
                      "rgba(54, 162, 235, 0.5)",
                      "rgba(255, 206, 86, 0.5)",
                      "rgba(75, 192, 192, 0.5)",
                      "rgba(153, 102, 255, 0.5)",
                      "rgba(255, 159, 64, 0.5)",
                      "rgba(255, 99, 132, 0.5)",
                    ],
                    borderColor: [
                      "rgba(255, 99, 132, 1)",
                      "rgba(54, 162, 235, 1)",
                      "rgba(255, 206, 86, 1)",
                      "rgba(75, 192, 192, 1)",
                      "rgba(153, 102, 255, 1)",
                      "rgba(255, 159, 64, 1)",
                      "rgba(255, 99, 132, 1)",
                    ],
                    borderWidth: 1,
                  },
                ],
              },
              options: {
                responsive: true,
              },
            });
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
