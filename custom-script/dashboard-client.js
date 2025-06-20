function onLoadForm() {
    window.this = this;
    this.entity.PacienteId = this.session.UserId;
    addIconSearch.call(this);
}

function addIconSearch() {
    const observer = new MutationObserver((mutations, obs) => {
        const input = document.querySelector('.custom-Busca');

        if (input) {
            obs.disconnect();

            const container = document.createElement('div');
            container.classList.add('search-container');

            const icon = document.createElement('i');
            icon.classList.add('fas', 'fa-search', 'search-icon');

            input.parentNode.insertBefore(container, input);
            container.appendChild(input);
            container.appendChild(icon);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

function formatPrices() {
    console.log(`formatPrices`, this);
    const prices = this.currentRepeater.value;
    if (prices && prices.length > 0) {
        for (let price of prices) {
            let value = price.Price;
            const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
            price.Price = formattedPrice;
        }
    }
    formatDates.call(this);
}

function formatDates() {
    console.log(`formatDates`, this);
    const repeaterItems = this.getField("RepeaterCards")[0]?.value;

    if (repeaterItems && repeaterItems.length > 0) {
        for (let item of repeaterItems) {
            let rawDate = item.DateService;
            if (rawDate) {
                let date = new Date(rawDate);
                if (isNaN(date.getTime())) {
                    const [year, month, day] = rawDate.split('-').map(Number);
                    date = new Date(year, month - 1, day);
                }

                if (isNaN(date.getTime())) {
                    console.warn(`Data inválida encontrada: ${rawDate}`);
                    continue;
                }

                const options = { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' };
                item.DateService = date.toLocaleDateString('pt-BR', options).replace('.', '');
            }
        }
    }
    formateDateColumn.call(this)
}

function formateDateColumn() {
    const observer = new MutationObserver((mutations, obs) => {
        const dateElements = document.querySelectorAll(".custom-HTMLField1");

        if (dateElements.length > 0) {
            console.log(`Encontrados ${dateElements.length} elementos de data. Aplicando formatação...`);
            
            const formatDate = (element, index) => {
                let dateText = element.innerText.trim();
                let dateParts = dateText.split(" de ");

                if (dateParts.length === 3) {
                    element.innerHTML = `
                        <span id="date-day">${dateParts[0]}</span>
                        <span id="date-month">${dateParts[1].toUpperCase()}</span>
                        <span id="date-year">${dateParts[2]}</span>
                    `;

                    element.style.display = "flex";
                    element.style.flexDirection = "column";
                    element.style.textAlign = "center";
                }
            };

            dateElements.forEach((el, index) => formatDate(el, index));
            dateElements.forEach((el, index) => {
                const innerObserver = new MutationObserver(() => formatDate(el, index));
                innerObserver.observe(el, { childList: true, subtree: true, characterData: true });
            });
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

// function setTodos() {
//     debugger
//     const observer = new MutationObserver((mutations, obs) => {
//         const selectElement = document.querySelector('.custom-DropdownDBId');

//         if (selectElement) {
//             let firstOption = selectElement.querySelector('option:first-child');
            
//             if (firstOption && firstOption.value === '0: null') {
//                 firstOption.setAttribute('label', 'Todas as especialidades');
//                 firstOption.selected = true;
//             }

//             // Interrompe a observação após a alteração
//             obs.disconnect();
//         }
//     });

//     observer.observe(document.body, { childList: true, subtree: true });
// }

// Chamada da função



// function formatPrices() {
//     console.log(`formatPrices`, this);
//     const prices = this.currentRepeater.value;
//     const moneyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
//     if (prices && prices.length > 0) {
//         for (let price of prices) {
//             let value = price.Price;

//             console.log(`Valor original recebido:`, value, `Tipo:`, typeof value); // Depuração

//             if (typeof value === "string") {
//                 // Remover apenas separadores de milhar e trocar vírgula decimal por ponto
//                 value = value.replace(/\./g, "").replace(",", ".");
//                 console.log(`Após remover separadores:`, value);
//                 value = parseFloat(value); // Converter para número com decimais
//             }

//             console.log(`Valor convertido para número:`, value);

//             if (!isNaN(value)) {
//                 price.Price = moneyFormatter.format(value);
//             } else {
//                 console.warn(`Valor inválido encontrado e não será formatado:`, price.Price);
//             }
//         }
//     }
// }

// const dropdown = document.querySelector('select[name="DropdownDBId"]');

// dropdown.addEventListener('change', function () {
//     if (dropdown.value === '0') {
//         dropdown.value = '0';
//     }
// });
