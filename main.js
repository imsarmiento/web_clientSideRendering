const dataURL =
  "https://gist.githubusercontent.com/josejbocanegra/b1873c6b7e732144355bb1627b6895ed/raw/d91df4c8093c23c41dce6292d5c1ffce0f01a68b/newDatalog.json";

const body_events = document.getElementById("body-events");
const body_correlation = document.getElementById("body-correlation");

const mcc = (evento, squirrel, not_squirrel) => {
  //console.log(evento);
  var TP = evento["true"];
  var FN = evento["false"];
  //console.log(TP, FN);
  var FP = squirrel - TP;
  var TN = not_squirrel - FN;
  //console.log(FP, TN);
  return (
    (TP * TN - FP * FN) /
    Math.sqrt((TP + FP) * (TP + FN) * (TN + FP) * (TN + FN))
  );
};

// Obtener los datos y crear la tabla
fetch(dataURL)
  .then((response) => response.json())
  .then((data) => {
    //console.log(data);
    let i = 1;
    let events_count = {};
    let squirrel = 0;
    let not_squirrel = 0;

    data.forEach((evento) => {
      // Crear las filas
      //console.log(evento);
      let newRow = body_events.insertRow(-1);
      let newCell = newRow.insertCell(-1);
      let newText = document.createTextNode(i);
      newCell.appendChild(newText);

      newCell = newRow.insertCell(-1);
      newText = document.createTextNode(evento.events.toString());
      newCell.appendChild(newText);

      newCell = newRow.insertCell(-1);
      newText = document.createTextNode(evento.squirrel);
      newCell.appendChild(newText);

      // Resaltar las filas
      if (evento.squirrel) {
        newRow.classList.add("bg-danger");
      }

      // Almacernar la incidencia de cada evento para calcular mcc
      i += 1;
      evento.events.forEach((event) => {
        if (!events_count.hasOwnProperty(event)) {
          events_count[event] = {};
          events_count[event]["true"] = 0;
          events_count[event]["false"] = 0;
        }
        if (evento.squirrel) events_count[event]["true"] += 1;
        else events_count[event]["false"] += 1;
      });

      // Calcualar valores totales
      if (evento.squirrel) squirrel += 1;
      else not_squirrel += 1;
    });
    //console.log(events_count);
    //console.log(squirrel);
    //console.log(not_squirrel);

    // Calcular el mcc de cada evento
    i = 1;
    let arr_events = Object.entries(events_count);
    for (const evento of arr_events) {
      //console.log(evento);
      MCC = mcc(evento[1], squirrel, not_squirrel);
      evento[1]["mcc"] = MCC;
    }

    //Ordenar los eventos por su mcc
    //console.log(arr_events);
    arr_events.sort((a, b) =>
      a[1].mcc > b[1].mcc ? -1 : b[1].mcc > a[1].mcc ? +1 : 0
    );

    // Crear las filas para cada evento y su correlacion
    for (const evento of arr_events) {
      let newRow = body_correlation.insertRow(-1);
      let newCell = newRow.insertCell(-1);
      let newText = document.createTextNode(i);
      newCell.appendChild(newText);

      newCell = newRow.insertCell(-1);
      newText = document.createTextNode(evento[0]);
      newCell.appendChild(newText);

      newCell = newRow.insertCell(-1);
      newText = document.createTextNode(evento[1]["mcc"]);
      newCell.appendChild(newText);
    }
  });
