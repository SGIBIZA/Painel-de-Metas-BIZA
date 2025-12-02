// -------------------------------------
// TABELA BÁSICA PARA TESTE DO CSV N3
// -------------------------------------

function carregarN3() {
  Papa.parse("https://raw.githubusercontent.com/SGIBIZA/Teste-1/main/base_n3.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {

      const dados = results.data || [];
      const mesSelecionado = document.getElementById("filtroMes").value; 
      const anoSelecionado = document.getElementById("filtroAno").value;

      const container = document.getElementById("cards-container");
      container.innerHTML = "";

      // Criar tabela
      let tabela = `
        <table border="1" style="width:100%; border-collapse:collapse; font-size:14px;">
          <thead>
            <tr>
              <th>Área</th>
              <th>Indicador</th>
              <th>Meta</th>
              <th>Resultado</th>
              <th>Mês</th>
              <th>Ano</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
      `;

      // Ajuste: coluna correta no CSV = "Mes texto" (sem acento)
      const filtrado = dados.filter(r => 
        (r["Mes texto"] || "").trim() === mesSelecionado &&
        String(r["Ano"] || "").trim() === anoSelecionado
      );

      if (filtrado.length === 0) {
        container.innerHTML = `
          <div style="
            padding: 20px; 
            background:#FFF8E1; 
            border:1px solid #F0C36D; 
            border-radius:10px; 
            color:#6B4E16;
          ">
            Nenhum dado encontrado para ${mesSelecionado} / ${anoSelecionado}.
          </div>
        `;
        return;
      }

      filtrado.forEach(r => {
        tabela += `
          <tr>
            <td>${r["Área"] || "-"}</td>
            <td>${r["Indicador"] || "-"}</td>
            <td>${r["Meta"] || "-"}</td>
            <td>${r["Resultado"] || "-"}</td>
            <td>${r["Mes texto"] || "-"}</td>
            <td>${r["Ano"] || "-"}</td>
            <td>${r["Status"] || "-"}</td>
          </tr>
        `;
      });

      tabela += "</tbody></table>";

      container.innerHTML = tabela;
    }
  });
}

// Eventos
document.addEventListener("DOMContentLoaded", carregarN3);
document.getElementById("filtroMes").addEventListener("change", carregarN3);
document.getElementById("filtroAno").addEventListener("change", carregarN3);
