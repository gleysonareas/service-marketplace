let valores;
function onLoadForm() {
    window.AtendimentoAgendado = this;
    let idFromCalendar = sessionStorage.getItem('idFromCalendar');
    if (AtendimentoAgendado.session) {
        console.log('id', AtendimentoAgendado.session.Scheduling_timeId);
    }
    AtendimentoAgendado.getField('RecebeDoCalendario').setValue(idFromCalendar);
    valoresDoModal.call(AtendimentoAgendado);
}
window.confirm = () => {
    AtendimentoAgendado.getField('Confirmar').setValue(true);
    AtendimentoAgendado.getField('Cancelar').setValue(false);
    AtendimentoAgendado.getField('Confirmar').detectChanges();
    AtendimentoAgendado.getField('Cancelar').detectChanges();

    saveConfirmation(true, false);

    Swal.fire({
        title: "Atendimento Confirmado",
        text: "O atendimento foi confirmado com sucesso.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
    });

    if (window.dialogInstance) {
        window.dialogInstance.close();
    } else {
        document.querySelector('.close.close-modal').click();
    }
};


function valoresDoModal() {
    //   let intervalId = setInterval(() => {
    //     if (AtendimentoAgendado.getField) {
    //       let objeto = AtendimentoAgendado.getField('RepeaterAtendimento')[0].value[0];
    //       if(!objeto.SemConvenio || objeto.SemConvenio === '') {
    //         AtendimentoAgendado.entity.SemConvenio = "Sem Convênio";
    //       }
    //       valores = objeto;
    //       clearInterval(intervalId);
    //     }
    //   }, 800);

}

function afterApiCall(response) {
    console.log('alguma resposta', this.response);
    console.log('alguma resposta2', response);
}

// Pop-up de confirmação de cancelamento
function CancellationNotification() {
    // Garante que não haverá execução duplicada
    if (window.__isCancelling__) return;
    window.__isCancelling__ = true;

    // Ajustar z-index do modal
    Swal.fire({
        title: "Regras de cancelamento",
        position: "center",
        html: "-Estorno Total, se cancelado com mais de 24 horas de antecedência do horário reservado.<br>" +
            "-Estorno de 60%, se cancelado com menos de 24 horas de antecedência do horário reservado.<br>" +
            "-Sem estorno se cancelado com menos de 3 horas de antecedência ou No-Show.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, cancelar",
        cancelButtonText: "Não, voltar",
        customClass: {
            popup: 'zindex-swal-popup'
        },
        didOpen: () => {
            // Adiciona um z-index alto no popup, como 9999
            const popup = document.querySelector('.swal2-popup');
            if (popup) popup.style.zIndex = '9999';
        }
    }).then((result) => {
        window.__isCancelling__ = false;

        if (result.isConfirmed) {
            console.log('confirmou', result.isConfirmed);
            AtendimentoAgendado.getField("Cancelar").setValue(true);
            AtendimentoAgendado.getField("Confirmar").setValue(false);
            AtendimentoAgendado.getField("Cancelar").detectChanges();
            AtendimentoAgendado.getField("Confirmar").detectChanges();
            saveConfirmation(false, true)
            const button = document.querySelector('.trigger-api button');
            button.click();
            Swal.fire({
                title: "Atendimento Cancelado",
                position: "center",
                text: "O atendimento foi cancelado com sucesso",
                icon: "success",
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                if (window.dialogInstance) {
                    window.dialogInstance.close();
                } else {
                    document.querySelector('.close.close-modal').click();
                }
            });
            // confirmCancel(AtendimentoAgendado.entity.ScheduledserviceId);


        } else if (result.dismiss === Swal.DismissReason.cancel) {

            Swal.fire({
                title: "Cancelamento Abortado",
                position: "center",
                text: "O cancelamento foi abortado pelo usuário",
                icon: "info",
                showConfirmButton: false,
                timer: 2000
            });
            if (window.dialogInstance) {
                window.dialogInstance.close();
            } else {
                document.querySelector('.close.close-modal').click();
            }
        }
    });
}


function setTextOfSerciceDate() {
    const atendimento = AtendimentoAgendado.getField('RepeaterAtendimento')[0].value || [];

    if (atendimento.length > 0) {
        const dataIso = atendimento[0].Date; // "2025-05-28T00:00:00Z"
        const horaStr = atendimento[0].Time; // "13:00:00"

        if (!dataIso || !horaStr) return;

        // Extrai partes da data e hora
        const dataObjUtc = new Date(dataIso);
        const partesHora = horaStr.split(':'); // ["13", "00", "00"]

        // Cria data ajustada a partir do valor UTC, ignorando o shift de fuso
        const dataUtc = new Date(Date.UTC(
            dataObjUtc.getUTCFullYear(),
            dataObjUtc.getUTCMonth(),
            dataObjUtc.getUTCDate(),
            parseInt(partesHora[0], 10),
            parseInt(partesHora[1], 10)
        ));
        // Agora transforma a data UTC em local para exibição correta
        const dataLocal = new Date(dataUtc.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));

        const diasSemana = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
        const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
            'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

        const diaSemana = diasSemana[dataLocal.getDay()];
        const dia = dataLocal.getDate();
        const mes = meses[dataLocal.getMonth()];
        const ano = dataLocal.getFullYear();

        const horaFormatada = `${String(dataLocal.getHours()).padStart(2, '0')}:${String(dataLocal.getMinutes()).padStart(2, '0')}`;

        const textoFinal = `${capitalize(diaSemana)}, ${dia} de ${mes} ${ano} às ${horaFormatada}`;

        AtendimentoAgendado.getField('DataText').setValue(textoFinal);
        AtendimentoAgendado.getField('DataText').detectChanges();
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

function saveConfirmation(keepAppointment, cancelAppointment) {
    const confirmObjTosave = {
        scheduling_timeId: AtendimentoAgendado.entity.RecebeDoCalendario,
        Canceled: cancelAppointment,
        ServiceConfirmed: keepAppointment
    }
    console.log('objeto', confirmObjTosave);
    console.log('id do agendamento', AtendimentoAgendado.entity.ScheduledserviceId);
    AtendimentoAgendado.getPageClass('atendimento')
        .save(confirmObjTosave, false, false, false);
}

// Se liberado fazer a reuisição pelo ajax, usaremos o código e não o botão extra

// function confirmCancel(recurrenceId) {
//   const url = `https://service-marketplace.azurewebsites.net/ServiceMarketplace/CancelAppointment/${recurrenceId}`;

//   fetch(url, {
//     method: 'POST',
//     headers: {
//       'Accept': 'application/json',
//       'Content-Type': 'application/json; charset=utf-8', // Corrigido o 'content-type'
//       'Authorization': 'Bearer testedetoken'
//     }
//   })
//   .then(response => {
//     if (!response.ok) {
//       throw new Error(`Erro na requisição: ${response.status}`);
//     }
//     return response.json();
//   })
//   .then(data => {
//     console.log('Agendamento cancelado com sucesso:', data);
//   })
//   .catch(error => {
//     console.error('Erro ao cancelar agendamento:', error);
//   });
// }

