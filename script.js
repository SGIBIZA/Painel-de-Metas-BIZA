const mensagensFaixa = {
  'Faixa 1': 'Não atingido, muito ruim!',
  'Faixa 2': 'Não atingido, ruim!',
  'Faixa 3': 'Atingido!',
  'Faixa 4': 'Atingido, bom resultado, parabéns!',
  'Faixa 5': 'Atingido, ótimo resultado, parabéns!',
  'Faixa 6': 'Atingido, excelente resultado, parabéns!'
};

function carregarMetas() {
  Papa.parse("https://raw.githubusercontent.com/SGIBIZA/Painel-de-Metas-BIZA/main/Painel_metas_BIZA.csv", {
    download: true,
    header: true,
    complete: function(results) {
      const dados = results.data;

      const mes = document.getElementById("mesFiltro").value;
      const ano = document.getElementById("anoFiltro").value;

      const container = document.getElementById("conteudo");
      container.innerHTML = '';

      const filtrado = dados.filter(row => row.MêsTexto === mes && row.Ano === ano);

      filtrado.forEach(row => {
        if (!row.Meta) return;

        let resultadoFormatado = row.Resultado;
        const num = parseFloat(resultadoFormatado);
        if (!isNaN(num)) {
          resultadoFormatado = (num * 100).toFixed(2).replace('.', ',') + '%';
        }

        const faixa = row["Faixa atingida"];
        const descricao = row["Descrição da Meta"];
        const peso = row["Peso"];

        // Define status class e cor de fundo
        let statusClass = '';
        let bgColor = '';
        if (row.Status === 'Atingida') {
          statusClass = 'parcial';
          bgColor = '#fff7e0'; // amarelo claro
        } else if (row.Status === 'Atingida além da meta') {
        statusClass = 'atingida';
          bgColor = '#e0f8e0'; // verde claro
        } else {
          statusClass = 'naoatingida';
          bgColor = '#fde0e0'; // vermelho claro
        }

        // Criação do card visual
        const card = document.createElement("div");
        card.className = `card ${statusClass}`;
        card.style.backgroundColor = bgColor;
        card.style.borderRadius = "12px";
        card.style.padding = "1rem";
        card.style.margin = "1rem auto";
        card.style.maxWidth = "800px";
        card.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
        card.style.borderLeft = `6px solid ${statusClass === 'atingida' ? 'green' : statusClass === 'parcial' ? 'orange' : 'red'}`;

        card.innerHTML = `
          <strong>${row.Meta}</strong> – ${descricao}<br>
          <strong>Resultado:</strong> ${resultadoFormatado}<br>
          <strong>Faixa:</strong> ${faixa}<br>
          ${mensagensFaixa[faixa] || ''}<br>
          <strong>Peso:</strong> ${peso}
        `;

        container.appendChild(card);
      });
    }
  });
}

// Executa ao carregar a página
document.addEventListener("DOMContentLoaded", carregarMetas);

// Atualiza ao mudar filtros
document.getElementById("mesFiltro").addEventListener("change", carregarMetas);
document.getElementById("anoFiltro").addEventListener("change", carregarMetas);
