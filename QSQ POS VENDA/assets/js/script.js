// utils
const qs = (selector) => document.querySelector(selector)
const qse = (element, selector) => element.querySelector(selector)

let acompanhamentos = JSON.parse(localStorage.getItem('acompanhamento_pos')) || []

function salvarAcompanhamentos() {
    localStorage.setItem('acompanhamento_pos', JSON.stringify(acompanhamentos))
}

function criarCelulaInput(tipo, classe, valorOuPlaceholder, isValor = false) {
    const td = document.createElement('td')
    const input = document.createElement('input')
    input.type = tipo
    input.className = classe
    input.style = 'width: 100%; padding: 4px; text-align:center;'
    input.maxLength = 40
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
    row.querySelectorAll('.phone:not([data-masked])').forEach(input => {
        $(input).mask('(00) 00000-0000')
        input.setAttribute('data-masked', 'true')
    })
}

function renderAcompanhamentos() {
    const tbody = qs('tbody')
    tbody.innerHTML = ''

    acompanhamentos.forEach((item, index) => {
        const row = document.createElement('tr')
        row.style.display = 'table-row'

        row.innerHTML = `
            <td>${item.date}</td>
            <td>${item.name}</td>
            <td>${item.phone}</td>
            <td>${item.order}</td>
            <td>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>${item.lens}</span>
                    <div style="display: flex; gap: 6px;">
                        <button class="concluido button">${item.concluido ? 'APAGAR' : 'CONCLUÍDO'}</button>
                        ${!item.concluido ? '<button class="editar button">EDITAR</button>' : ''}
                    </div>
                </div>
            </td>
        `

        if (item.concluido) {
            row.querySelectorAll('td').forEach((el) => {
                el.style.backgroundColor = '#abdc18'
                el.style.color = '#FFFFFF'
                el.style.fontWeight = 'bold'
            })
        } else {
            row.querySelectorAll('td').forEach((el) => {
                el.style.backgroundColor = '#8b4513'
                el.style.fontWeight = 'bold'
                el.style.color = '#FFFFFF'
            })
        }

        const concluirBtn = qse(row, '.concluido')
        const editarBtn = qse(row, '.editar')

        concluirBtn.onclick = () => {
            if (!item.concluido) {
                item.concluido = true
                salvarAcompanhamentos()
                renderAcompanhamentos()
            } else {
                acompanhamentos.splice(index, 1)
                salvarAcompanhamentos()
                renderAcompanhamentos()
            }
        }

        if (editarBtn) {
            editarBtn.onclick = () => {
                editarAcompanhamento(row, item, index)
            }
        }

        tbody.appendChild(row)
    })
}

function editarAcompanhamento(row, item, index) {
    row.innerHTML = ''
    row.appendChild(criarCelulaInput('text', 'date', item.date, true))
    row.appendChild(criarCelulaInput('text', 'name', item.name, true))
    row.appendChild(criarCelulaInput('text', 'phone', item.phone, true))
    row.appendChild(criarCelulaInput('text', 'order', item.order, true))

    const tdLens = document.createElement('td')
    const container = document.createElement('div')
    container.style = 'display: flex; gap: 6px; align-items: center;'

    const input = document.createElement('input')
    input.type = 'text'
    input.className = 'lens'
    input.value = item.lens
    input.maxLength = 40
    input.style = 'flex: 1; padding: 4px; text-align:center;'

    const btn = document.createElement('button')
    btn.className = 'confirmButton button'
    btn.textContent = 'CONFIRMAR'

    container.append(input, btn)
    tdLens.appendChild(container)
    row.appendChild(tdLens)

    aplicarMascaras(row)
    handleConfirm(row, index)
}

qs('#novoAcompanhamento').addEventListener('click', (e) => {
    e.preventDefault()

    if (document.querySelectorAll('input').length > 0) return

    const row = document.createElement('tr')
    row.style.display = 'table-row'

    row.appendChild(criarCelulaInput('text', 'date', 'DATA...'))
    row.appendChild(criarCelulaInput('text', 'name', 'NOME...'))
    row.appendChild(criarCelulaInput('text', 'phone', 'TELEFONE...'))
    row.appendChild(criarCelulaInput('text', 'order', 'DADOS...'))

    const tdLens = document.createElement('td')
    const container = document.createElement('div')
    container.style = 'display: flex; gap: 6px; align-items: center;'

    const input = document.createElement('input')
    input.type = 'text'
    input.className = 'lens'
    input.placeholder = 'DIOPTRIA...'
    input.maxLength = 40
    input.style = 'flex: 1; padding: 4px; text-align:center;'

    const btn = document.createElement('button')
    btn.className = 'confirmButton button'
    btn.textContent = 'CONFIRMAR'

    container.append(input, btn)
    tdLens.appendChild(container)
    row.appendChild(tdLens)

    aplicarMascaras(row)

    row.querySelectorAll('input').forEach((input) => {
        input.addEventListener('input', () => {
            if (input.value.trim() !== '') input.classList.remove('error')
        })
    })

    handleConfirm(row)
    qs('tbody').appendChild(row)
})

function handleConfirm(row, editIndex = null) {
    const confirmBtn = qse(row, '.confirmButton')
    if (!confirmBtn) return

    confirmBtn.onclick = (event) => {
        event.preventDefault?.()

        let verification = true
        const dateInput = qse(row, '.date')
        const nameInput = qse(row, '.name')
        const phoneInput = qse(row, '.phone')
        const orderInput = qse(row, '.order')
        const lensInput = qse(row, '.lens')

        const inputs = [
            { input: dateInput, message: 'PREENCHA A DATA' },
            { input: nameInput, message: 'PREENCHA O NOME' },
            { input: phoneInput, message: 'PREENCHA O TELEFONE' },
            { input: orderInput, message: 'PREENCHA OS DADOS' },
            { input: lensInput, message: 'PREENCHA A DIOPTRIA' },
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

        const novoAcompanhamento = {
            date: dateInput.value,
            name: nameInput.value,
            phone: phoneInput.value,
            order: orderInput.value,
            lens: lensInput.value,
            concluido: false
        }

        if (editIndex !== null) {
            novoAcompanhamento.concluido = acompanhamentos[editIndex].concluido || false
            acompanhamentos[editIndex] = novoAcompanhamento
        } else {
            acompanhamentos.push(novoAcompanhamento)
        }

        salvarAcompanhamentos()
        renderAcompanhamentos()
    }
}

// Inicializa
renderAcompanhamentos()

function fazerBackup() {
    if (acompanhamentos.length === 0) {
        alert('Não há dados para backup.')
        return
    }

    const dadosJSON = JSON.stringify(acompanhamentos, null, 2)
    const blob = new Blob([dadosJSON], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `backup_pos_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

// Conecta o botão com a função
qs('#btnBackup').addEventListener('click', fazerBackup)
