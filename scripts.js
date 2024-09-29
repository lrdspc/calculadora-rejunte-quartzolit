document.addEventListener('DOMContentLoaded', () => {
    const tipoRejunte = document.getElementById("tipoRejunte");
    const juntaAssentamentoInput = document.getElementById("juntaAssentamento");
    const calcularBtn = document.getElementById("calcularBtn");
    const ajudaBtn = document.getElementById("ajudaBtn");
    const resetBtn = document.getElementById("resetBtn");
    const form = document.getElementById("rejunteForm");

    // Ativar botão de calcular somente quando todos os campos forem válidos
    form.addEventListener('input', () => {
        const isValid = form.checkValidity();
        calcularBtn.disabled = !isValid;
    });

    // Alternar visibilidade da seção de ajuda
    ajudaBtn.addEventListener('click', toggleAjuda);

    // Atualizar limites de junta de assentamento ao mudar o tipo de rejunte
    tipoRejunte.addEventListener('change', atualizarLimitesJuntaAssentamento);

    // Manipular submissão do formulário
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        calcularConsumo();
    });

    // Manipular reset do formulário
    resetBtn.addEventListener('click', resetForm);

    // Função para alternar visibilidade da seção de ajuda
    function toggleAjuda() {
        const ajudaSection = document.getElementById("ajudaSection");
        const isActive = ajudaSection.classList.toggle('active');
        ajudaSection.setAttribute('aria-hidden', !isActive);
    }

    // Função para atualizar os limites de junta de assentamento conforme o tipo de rejunte selecionado
    function atualizarLimitesJuntaAssentamento() {
        const tipo = tipoRejunte.value;
        const dadosRejunte = obterDadosRejunte(tipo);

        if (tipo === "") {
            juntaAssentamentoInput.min = "";
            juntaAssentamentoInput.max = "";
            juntaAssentamentoInput.placeholder = "Selecione o tipo de rejunte primeiro";
            juntaAssentamentoInput.value = "";
            return;
        }

        juntaAssentamentoInput.min = dadosRejunte.minJuntaAssentamento;
        juntaAssentamentoInput.max = dadosRejunte.maxJuntaAssentamento;
        juntaAssentamentoInput.placeholder = `Junta de assentamento (mm) - de ${dadosRejunte.minJuntaAssentamento} a ${dadosRejunte.maxJuntaAssentamento} mm`;
    }

    // Função para converter unidades para mm
    function converterParaMM(valor, unidade) {
        if (unidade === "cm") {
            return valor * 10;
        }
        return valor; // mm
    }

    // Função para calcular o consumo de rejunte
    function calcularConsumo() {
        const tipo = tipoRejunte.value;
        const juntaAssentamentoRaw = parseFloat(juntaAssentamentoInput.value);
        const ladoARaw = parseFloat(document.getElementById("ladoA").value);
        const ladoBRaw = parseFloat(document.getElementById("ladoB").value);
        const espessuraRaw = parseFloat(document.getElementById("espessura").value);
        const areaInserida = parseFloat(document.getElementById("areaInserida").value);
        const dadosRejunte = obterDadosRejunte(tipo);

        const unidadeLadoA = document.getElementById("unidadeLadoA").value;
        const unidadeLadoB = document.getElementById("unidadeLadoB").value;

        const errorMessage = document.getElementById("error-message");
        const resultados = document.querySelector('.resultados');

        // Limpa a mensagem de erro anterior e esconde resultados
        errorMessage.style.display = "none";
        errorMessage.innerText = "";
        resultados.classList.remove('active');

        // Validação dos campos
        if (
            !tipo ||
            isNaN(juntaAssentamentoRaw) ||
            isNaN(ladoARaw) ||
            isNaN(ladoBRaw) ||
            isNaN(espessuraRaw) ||
            isNaN(areaInserida) ||
            juntaAssentamentoRaw <= 0 ||
            ladoARaw <= 0 ||
            ladoBRaw <= 0 ||
            espessuraRaw <= 0 ||
            areaInserida <= 0
        ) {
            errorMessage.innerText = "Por favor, preencha todos os campos corretamente e insira valores positivos.";
            errorMessage.style.display = "block";
            return;
        }

        // Conversão das unidades para mm
        const juntaAssentamento = converterParaMM(juntaAssentamentoRaw, "mm"); // Junta sempre em mm
        const ladoA = converterParaMM(ladoARaw, unidadeLadoA);
        const ladoB = converterParaMM(ladoBRaw, unidadeLadoB);
        const espessura = converterParaMM(espessuraRaw, "mm"); // Espessura sempre em mm

        // Verifica se a junta de assentamento está nos limites permitidos
        if (juntaAssentamento < dadosRejunte.minJuntaAssentamento || juntaAssentamento > dadosRejunte.maxJuntaAssentamento) {
            errorMessage.innerText = `A junta de assentamento deve estar entre ${dadosRejunte.minJuntaAssentamento} e ${dadosRejunte.maxJuntaAssentamento} mm para o tipo de rejunte selecionado.`;
            errorMessage.style.display = "block";
            return;
        }

        // Cálculo do consumo
        const coeficiente = dadosRejunte.coeficiente;
        let consumoPorM2 = ((ladoA + ladoB) * espessura * juntaAssentamento * coeficiente) / (ladoA * ladoB);
        let consumoTotal = consumoPorM2 * areaInserida;

        // Arredonda os valores
        consumoPorM2 = parseFloat(consumoPorM2.toFixed(3)); // Arredonda para 3 casas decimais
        consumoTotal = parseFloat(consumoTotal.toFixed(2)); // Arredonda para 2 casas decimais

        // Exibe os resultados
        document.getElementById("resultadoArea").innerText = `${areaInserida} m²`;
        document.getElementById("resultadoConsumoPorM2").innerText = `${consumoPorM2} Kg/m²`;
        document.getElementById("resultadoConsumoTotal").innerText = `${consumoTotal} Kg`;

        // Atualiza o link do tipo de rejunte
        const linkRejunte = document.getElementById("linkRejunte");
        if (dadosRejunte.link) {
            linkRejunte.href = dadosRejunte.link;
            linkRejunte.innerText = `SAIBA MAIS SOBRE O REJUNTE ${tipo.toUpperCase()} QUARTZOLIT`;
            linkRejunte.style.display = 'inline-block';
        } else {
            linkRejunte.href = "#";
            linkRejunte.innerText = "SAIBA MAIS SOBRE O REJUNTE QUARTZOLIT";
            linkRejunte.style.display = 'none';
        }

        // Mostra os resultados com animação suave
        setTimeout(() => {
            resultados.classList.add('active');
        }, 100); // Pequeno atraso para permitir o CSS transição
    }

    // Função para redefinir o formulário e ocultar resultados e mensagens de erro
    function resetForm() {
        document.querySelector('.resultados').classList.remove('active');
        document.getElementById("error-message").style.display = 'none';
        document.getElementById("error-message").innerText = "";
        document.getElementById("linkRejunte").href = "#";
        document.getElementById("linkRejunte").innerText = "SAIBA MAIS SOBRE O REJUNTE QUARTZOLIT";
        document.getElementById("linkRejunte").style.display = 'inline-block';
        juntaAssentamentoInput.placeholder = "Selecione o tipo de rejunte primeiro"; // Corrige o placeholder ao resetar
    }

    // Função para obter os limites de junta de assentamento e coeficiente de cada tipo de rejunte
    function obterDadosRejunte(tipoRejunte) {
        const dados = {
            coeficiente: 1.58,
            minJuntaAssentamento: 1,
            maxJuntaAssentamento: 10,
            link: "https://www.quartzolit.weber/argamassas-e-rejuntes-quartzolit/rejuntes-quartzolit/"
        };

        switch (tipoRejunte) {
            case "ceramicas":
                return { 
                    coeficiente: 1.75, 
                    minJuntaAssentamento: 2,  
                    maxJuntaAssentamento: 10, 
                    link: "https://www.quartzolit.weber/argamassas-e-rejuntes-quartzolit/rejuntes-quartzolit/rejunte-ceramicas-quartzolit" 
                };
            case "porcelanato":
                return { 
                    coeficiente: 1.62, 
                    minJuntaAssentamento: 1, 
                    maxJuntaAssentamento: 10, 
                    link: "https://www.quartzolit.weber/argamassas-e-rejuntes-quartzolit/rejuntes-quartzolit/rejunte-porcelanatos-e-ceramicas-quartzolit" 
                };
            case "acrilico":
                return { 
                    coeficiente: 1.58, 
                    minJuntaAssentamento: 1, 
                    maxJuntaAssentamento: 4, 
                    link: "https://www.quartzolit.weber/argamassas-e-rejuntes-quartzolit/rejuntes-quartzolit/rejunte-acrilico-quartzolit" 
                };
            case "piscinas":
                return { 
                    coeficiente: 1.62, 
                    minJuntaAssentamento: 2, 
                    maxJuntaAssentamento: 10, 
                    link: "https://www.quartzolit.weber/argamassas-e-rejuntes-quartzolit/rejuntes-quartzolit/rejunte-piscinas-quartzolit" 
                };
            case "epoxi":
                return { 
                    coeficiente: 1.58, 
                    minJuntaAssentamento: 1, 
                    maxJuntaAssentamento: 5, 
                    link: "https://www.quartzolit.weber/argamassas-e-rejuntes-quartzolit/rejuntes-quartzolit/rejunte-epoxi-superfacil-quartzolit" 
                };
            default:
                return dados;
        }
    }
});
