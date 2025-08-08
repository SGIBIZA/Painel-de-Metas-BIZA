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

      const mesSelect = document.getElementById("mesFiltro");
      const ano = document.getElementById("anoFiltro").value;
      const mes = mesSelect.value;
      const mesTexto = mesSelect.options[mesSelect.selectedIndex].text;

      const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
      const mesIndex = meses.indexOf(mesTexto);
      const proximoMes = meses[(mesIndex + 1) % 12];

      document.querySelector("header h1").innerText =
        `Metas Salariais – Resultado de ${mesTexto} ${ano} – Pagamento de ${proximoMes}`;

      const container = document.getElementById("conteudo");
      container.innerHTML = '';

      const filtrado = dados.filter(row => row.MêsTexto === mes && row.Ano === ano);

      // ---------- Empty state (sem dados para o mês filtrado) ----------
      if (!filtrado || filtrado.length === 0) {
        const mesNumero = {
          'Janeiro':'01','Fevereiro':'02','Março':'03','Abril':'04','Maio':'05','Junho':'06',
          'Julho':'07','Agosto':'08','Setembro':'09','Outubro':'10','Novembro':'11','Dezembro':'12'
        }[proximoMes] || '';

        const msg = `Dados para os cálculos do pagamento de ${proximoMes} serão fechados até dia 20/${mesNumero}.`;

        container.innerHTML = `
          <div style="
            max-width: 800px; margin: 2rem auto; padding: 1rem 1.25rem;
            border-radius: 12px; background: #FFF8E1; border: 1px solid #F0C36D;
            color: #6B4E16; text-align: center; font-size: 1rem;">
            ${msg}
          </div>`;
        return; // nada mais a fazer
      }
      // -----------------------------------------------------------------

      filtrado.forEach(row => {
        if (!row.Meta) return;

        // Formata resultado (0.77 -> 77,00%)
        let resultadoFormatado = row.Resultado;
        const num = parseFloat(resultadoFormatado);
        if (!isNaN(num)) {
          resultadoFormatado = (num * 100).toFixed(2).replace('.', ',') + '%';
        }

        const faixa = row["Faixa atingida"];
        const descricao = row["Descrição da Meta"];
        const pesoBruto = row["Peso"]; // valor original do CSV (ex.: 0.2)

        // Mostra peso como percentual, mas sem afetar o dado bruto
        let pesoFormatado = pesoBruto;
        const pesoNum = parseFloat(pesoBruto);
        if (!isNaN(pesoNum)) {
          const p = (pesoNum <= 1 ? pesoNum * 100 : pesoNum); // se vier 0.2 => 20
          pesoFormatado = `${String(p).replace('.', ',')}%`;
        }

        let statusClass = '';
        let bgColor = '';
        if (row.Status === 'Atingida') {
          statusClass = 'parcial';
          bgColor = '#fff7e0';
        } else if (row.Status === 'Atingida além da meta') {
          statusClass = 'atingida';
          bgColor = '#e0f8e0';
        } else {
          statusClass = 'naoatingida';
          bgColor = '#fde0e0';
        }

        const card = document.createElement("div");
        card.className = `card ${statusClass}`;
        card.style.backgroundColor = bgColor;

        card.innerHTML = `
          <strong>${row.Meta}</strong> – ${descricao}<br>
          <strong>Resultado:</strong> ${resultadoFormatado}<br>
          <strong>Faixa:</strong> ${faixa}<br>
          ${mensagensFaixa[faixa] || ''}<br>
          <strong>Peso:</strong> ${pesoFormatado}
        `;

        container.appendChild(card);
      });
    }
  });
}

function abrirCalculadora() {
  const modal = document.getElementById("modal");
  const inputsHTML = [1,2,3,4,5,6].map(i =>
    `<input class='faixa-input' id='faixa${i}' type='number' placeholder='Faixa ${i}' required>`
  ).join("");
  document.getElementById("inputs-faixas").innerHTML = inputsHTML;

  // Capturar metas visíveis na tela
  const cards = document.querySelectorAll(".card");
  let tabelaHTML = `
    <table>
      <thead>
        <tr><th>Meta</th><th>Faixa</th><th>Peso</th></tr>
      </thead>
      <tbody>
  `;

  cards.forEach(card => {
    const html = card.innerHTML;

    const metaMatch = html.match(/<strong>(.*?)<\/strong>/);
    const faixaMatch = html.match(/Faixa:<\/strong>\s*(Faixa \d)/);
    const pesoMatch = html.match(/Peso:<\/strong>\s*([\d.,]+)%?/); // aceita "20%" ou "0,2"

    const meta = metaMatch ? metaMatch[1] : '';
    const faixa = faixaMatch ? faixaMatch[1] : '';
    const peso = pesoMatch ? pesoMatch[1].replace(',', '.') : '0';

    tabelaHTML += `<tr><td>${meta}</td><td>${faixa}</td><td>${peso}</td></tr>`;
  });

  tabelaHTML += '</tbody></table>';
  document.getElementById("tabelaMetasCalculadora").innerHTML = tabelaHTML;
  modal.style.display = "block";
}

function fecharModal() {
  document.getElementById("modal").style.display = "none";
}

function calcularSalario() {
  const faixas = {};
  for (let i = 1; i <= 6; i++) {
    faixas[`Faixa ${i}`] = parseFloat(document.getElementById(`faixa${i}`).value || 0);
  }

  let salario = 0;
  const linhas = document.querySelectorAll("#tabelaMetasCalculadora tbody tr");

  linhas.forEach(linha => {
    const faixa = linha.children[1].textContent.trim();
    const pesoRaw = parseFloat(linha.children[2].textContent.replace(',', '.')) || 0;

    // Se o peso estiver como 20 (i.e., "20%"), converte para 0.2
    const peso = (pesoRaw > 1) ? (pesoRaw / 100) : pesoRaw;

    const valorFaixa = faixas[faixa] || 0;
    salario += valorFaixa * peso;
  });

  alert("Salário Calculado: R$ " + salario.toFixed(2).replace('.', ','));
  fecharModal();
}

// Eventos ao carregar
document.addEventListener("DOMContentLoaded", carregarMetas);

// Filtros
document.getElementById("mesFiltro").addEventListener("change", carregarMetas);
document.getElementById("anoFiltro").addEventListener("change", carregarMetas);

// Botão da calculadora
document.getElementById("btnCalculadora").addEventListener("click", abrirCalculadora);
