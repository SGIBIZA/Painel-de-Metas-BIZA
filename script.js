const mensagensFaixa = {
  'Faixa 1': 'Não atingido, muito ruim!',
  'Faixa 2': 'Não atingido, ruim!',
  'Faixa 3': 'Atingido!',
  'Faixa 4': 'Atingido, bom resultado, parabéns!',
  'Faixa 5': 'Atingido, ótimo resultado, parabéns!',
  'Faixa 6': 'Atingido, excelente resultado, parabéns!'
};

Papa.parse("base_metas_biza.csv", {
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

      let statusClass = '';
      if (row.Status === 'Atingida') statusClass = 'atingida';
      else if (row.Status === 'Parcial') statusClass = 'parcial';
      else statusClass = 'naoatingida';

      const card = document.createElement("div");
      card.className = `card ${statusClass}`;
      card.innerHTML = `
        <strong>${row.Meta}</strong><br>
        <strong>Resultado:</strong> ${resultadoFormatado}<br>
        <strong>Faixa:</strong> ${row["Faixa atingida"]}<br>
        ${mensagensFaixa[row["Faixa atingida"]] || ''}
      `;
      container.appendChild(card);
    });
  }
});
