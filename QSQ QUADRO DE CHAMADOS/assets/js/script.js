// utils
const qs = (selector) => document.querySelector(selector)
const qse = (element, selector) => element.querySelector(selector)

let chamados = JSON.parse(localStorage.getItem('chamados')) || []

function salvarChamados() {
    localStorage.setItem('chamados', JSON.stringify(chamados))
}

function criarCelulaInput(tipo, classe, valorOuPlaceholder, isValor = false) {
    const td = document.createElement('td')
    const input = document.createElement('input')
    input.type = tipo
    input.className = classe
    input.style = 'width: 100%; padding: 4px; text-align:center;'
    if (isValor) input.value = valorOuPlaceholder
    else input.placeholder = valorOuPlaceholder
    td.appendChild(input)
    return td
}

function aplicarMascaras(row) {
    row.querySelectorAll('.date:not([data-masked])').forEach(input => {
        $(input).mask('00/00/0000')
        input.setAttribute('data-masked', 'true')
    })
    row.querySelectorAll('.protocol:not([data-masked])').forEach(input => {
        $(input).mask('00000')
        input.setAttribute('data-masked', 'true')
    })
    row.querySelectorAll('.phone:not([data-masked])').forEach(input => {
        $(input).mask('(00) 00000-0000')
        input.setAttribute('data-masked', 'true')
    })
}

function renderChamados() {
    const tbody = qs('tbody')
    tbody.innerHTML = ''

    chamados.forEach((chamado, index) => {
        const row = document.createElement('tr')
        row.style.display = 'table-row'

        row.innerHTML = `
            <td>${chamado.date}</td>
            <td>${chamado.protocol}</td>
            <td>${chamado.name}</td>
            <td>${chamado.phone}</td>
            <td>
                <div style='display: flex; justify-content: space-between; align-items: center;'>
                    <span>${chamado.reason}</span>
                    <div style='display: flex; gap: 6px;'>
                        <button class='concluido button'>${chamado.concluido ? 'APAGAR' : 'CONCLUÍDO'}</button>
                        ${!chamado.concluido ? "<button class='editar button'>EDITAR</button>" : ""}
                    </div>
                </div>
            </td>
        `

        const cells = row.querySelectorAll('td')
        cells.forEach(cell => {
            cell.style.backgroundColor = chamado.concluido ? '#abdc18' : '#8b4513'
            cell.style.color = '#FFFFFF'
            cell.style.fontWeight = 'bold'
        })

        const concluirBtn = qse(row, '.concluido')
        const editarBtn = qse(row, '.editar')

        concluirBtn.onclick = () => {
            if (!chamado.concluido) {
                chamado.concluido = true
            } else {
                chamados.splice(index, 1)
            }
            salvarChamados()
            renderChamados()
        }

        if (editarBtn) {
            editarBtn.onclick = () => {
                editarChamado(row, chamado, index)
            }
        }

        tbody.appendChild(row)
    })
}

function editarChamado(row, chamado, index) {
    row.innerHTML = ''
    row.appendChild(criarCelulaInput('text', 'date', chamado.date, true))
    row.appendChild(criarCelulaInput('text', 'protocol', chamado.protocol, true))
    row.appendChild(criarCelulaInput('text', 'name', chamado.name, true))
    row.appendChild(criarCelulaInput('text', 'phone', chamado.phone || '', true))

    const tdReason = document.createElement('td')
    const container = document.createElement('div')
    container.style = 'display: flex; gap: 6px; align-items: center;'

    const input = document.createElement('input')
    input.type = 'text'
    input.className = 'reason'
    input.value = chamado.reason
    input.maxLength = 15
    input.style = 'flex: 1; padding: 4px; text-align:center;'

    const btn = document.createElement('button')
    btn.className = 'confirmButton button'
    btn.textContent = 'CONFIRMAR'

    container.append(input, btn)
    tdReason.appendChild(container)
    row.appendChild(tdReason)

    aplicarMascaras(row)
    handleConfirm(row, index)
}

qs('#novoAcompanhamento').addEventListener('click', (e) => {
    e.preventDefault()
    if (document.querySelectorAll('input').length > 0) return

    const row = document.createElement('tr')
    row.style.display = 'table-row'

    row.appendChild(criarCelulaInput('text', 'date', 'DATA...'))
    row.appendChild(criarCelulaInput('text', 'protocol', 'PROTOCOLO...'))
    row.appendChild(criarCelulaInput('text', 'name', 'NOME...'))
    row.appendChild(criarCelulaInput('text', 'phone', 'TELEFONE...'))

    const tdReason = document.createElement('td')
    const container = document.createElement('div')
    container.style = 'display: flex; gap: 6px; align-items: center;'

    const input = document.createElement('input')
    input.type = 'text'
    input.className = 'reason'
    input.placeholder = 'MOTIVO...'
    input.maxLength = 15
    input.style = 'flex: 1; padding: 4px; text-align:center;'

    const btn = document.createElement('button')
    btn.className = 'confirmButton button'
    btn.textContent = 'CONFIRMAR'

    container.append(input, btn)
    tdReason.appendChild(container)
    row.appendChild(tdReason)

    qs('tbody').append(row)
    aplicarMascaras(row)

    row.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            if (input.value.trim() !== '') input.classList.remove('error')
        })
    })

    handleConfirm(row)
})

function handleConfirm(row, editIndex = null) {
    const confirmBtn = qse(row, '.confirmButton')
    if (!confirmBtn) return

    confirmBtn.onclick = (event) => {
        event.preventDefault?.()

        let verification = true
        const date = qse(row, '.date')
        const protocol = qse(row, '.protocol')
        const name = qse(row, '.name')
        const phone = qse(row, '.phone')
        const reason = qse(row, '.reason')

        const inputs = [
            { input: date, message: 'PREENCHA A DATA' },
            { input: protocol, message: 'PREENCHA O PROTOCOLO' },
            { input: name, message: 'PREENCHA O NOME' },
            { input: phone, message: 'PREENCHA O TELEFONE' },
            { input: reason, message: 'PREENCHA O MOTIVO' },
        ]

        const regexData = /^\d{2}\/\d{2}\/\d{4}$/

        inputs.forEach(({ input, message }) => {
            const isEmpty = input.value.trim() === ''
            if (input.classList.contains('date') && !regexData.test(input.value)) {
                input.classList.add('error')
                input.value = ''
                input.placeholder = 'DATA INVÁLIDA'
                verification = false
            } else if (isEmpty) {
                input.classList.add('error')
                input.placeholder = message
                verification = false
            } else {
                input.classList.remove('error')
            }
        })

        if (!verification) return

        const novoChamado = {
            date: date.value,
            protocol: protocol.value,
            name: name.value,
            phone: phone.value,
            reason: reason.value,
            concluido: false
        }

        if (editIndex !== null) {
            novoChamado.concluido = chamados[editIndex].concluido || false
            chamados[editIndex] = novoChamado
        } else {
            chamados.push(novoChamado)
        }

        salvarChamados()
        renderChamados()
    }
}

// Inicializa
renderChamados()

function fazerBackup() {
    if (chamados.length === 0) {
        alert('Não há dados para backup.')
        return
    }

    const dadosJSON = JSON.stringify(chamados, null, 2)
    const blob = new Blob([dadosJSON], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `backup_chamados_${new Date().toISOString().slice(0,10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

qs('#btnBackup').addEventListener('click', fazerBackup)
