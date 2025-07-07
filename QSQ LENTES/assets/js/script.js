// utils
const qs = (selector) => document.querySelector(selector)
const qse = (element, selector) => element.querySelector(selector)

let acompanhamentos = JSON.parse(localStorage.getItem('acompanhamentos')) || []

function salvarAcompanhamentos() {
  localStorage.setItem('acompanhamentos', JSON.stringify(acompanhamentos))
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
  row.querySelectorAll('.telefone:not([data-masked])').forEach(input => {
    $(input).mask('(00) 00000-0000')
    input.setAttribute('data-masked', 'true')
  })
}

function renderAcompanhamentos() {
  const tbody = qs('tbody')
  tbody.innerHTML = ''

  acompanhamentos.forEach((acomp, index) => {
    const row = document.createElement('tr')
    row.style.display = 'table-row'

    row.innerHTML = `
      <td>${acomp.date}</td>
      <td>${acomp.name}</td>
      <td>${acomp.telefone}</td>
      <td>${acomp.order}</td>
      <td>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>${acomp.lens}</span>
          <div style="display: flex; gap: 6px;">
            <button class="concluido button">${acomp.concluido ? 'APAGAR' : 'MARCAR COMO CONCLUÍDO'}</button>
            ${!acomp.concluido ? '<button class="editar button">EDITAR</button>' : ''}
          </div>
        </div>
      </td>
    `

    if (acomp.concluido) {
      row.querySelectorAll('td').forEach(td => {
        td.style.backgroundColor = '#abdc18'
        td.style.color = '#FFFFFF'
        td.style.fontWeight = 'bold'
      })
    } else {
      row.querySelectorAll('td').forEach(td => {
        td.style.backgroundColor = '##8e5061'
        td.style.color = '#FFFFFF'
        td.style.fontWeight = 'bold'
      })
    }

    const btnConcluir = qse(row, '.concluido')
    const btnEditar = qse(row, '.editar')

    btnConcluir.onclick = () => {
      if (!acomp.concluido) {
        acomp.concluido = true
      } else {
        acompanhamentos.splice(index, 1)
      }
      salvarAcompanhamentos()
      renderAcompanhamentos()
    }

    if (btnEditar) {
      btnEditar.onclick = () => {
        editarAcompanhamento(row, acomp, index)
      }
    }

    tbody.appendChild(row)
  })
}

function editarAcompanhamento(row, acomp, index) {
  row.innerHTML = ''
  row.appendChild(criarCelulaInput('text', 'date', acomp.date, true))
  row.appendChild(criarCelulaInput('text', 'name', acomp.name, true))
  row.appendChild(criarCelulaInput('text', 'telefone', acomp.telefone, true))
  row.appendChild(criarCelulaInput('text', 'order', acomp.order, true))

  const tdLens = document.createElement('td')
  const container = document.createElement('div')
  container.style = 'display: flex; gap: 6px; align-items: center;'

  const inputLens = document.createElement('input')
  inputLens.type = 'text'
  inputLens.className = 'lens'
  inputLens.value = acomp.lens
  inputLens.maxLength = 40
  inputLens.style = 'flex: 1; padding: 4px; text-align:center;'

  const btnConfirm = document.createElement('button')
  btnConfirm.className = 'confirmButton button'
  btnConfirm.textContent = 'CONFIRMAR'

  container.append(inputLens, btnConfirm)
  tdLens.appendChild(container)
  row.appendChild(tdLens)

  aplicarMascaras(row)
  handleConfirm(row, index)
}

qs('#novoAcompanhamento').addEventListener('click', e => {
  e.preventDefault()

  if (document.querySelectorAll('input').length > 0) return

  const row = document.createElement('tr')
  row.style.display = 'table-row'

  row.appendChild(criarCelulaInput('text', 'date', 'DATA...'))
  row.appendChild(criarCelulaInput('text', 'name', 'NOME DO CLIENTE...'))
  row.appendChild(criarCelulaInput('text', 'telefone', 'TELEFONE...'))
  row.appendChild(criarCelulaInput('text', 'order', 'ORDEM DE SERVIÇO...'))

  const tdLens = document.createElement('td')
  const container = document.createElement('div')
  container.style = 'display: flex; gap: 6px; align-items: center;'

  const inputLens = document.createElement('input')
  inputLens.type = 'text'
  inputLens.className = 'lens'
  inputLens.placeholder = 'LENTE...'
  inputLens.maxLength = 40
  inputLens.style = 'flex: 1; padding: 4px; text-align:center;'

  const btnConfirm = document.createElement('button')
  btnConfirm.className = 'confirmButton button'
  btnConfirm.textContent = 'CONFIRMAR'

  container.append(inputLens, btnConfirm)
  tdLens.appendChild(container)
  row.appendChild(tdLens)

  qs('tbody').appendChild(row)

  aplicarMascaras(row)

  row.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
      if (input.value.trim() !== '') input.classList.remove('error')
    })
  })

  handleConfirm(row)
})

function handleConfirm(row, editIndex = null) {
  const btnConfirm = qse(row, '.confirmButton')
  if (!btnConfirm) return

  btnConfirm.onclick = event => {
    event.preventDefault()

    let valid = true

    const dateInput = qse(row, '.date')
    const nameInput = qse(row, '.name')
    const telefoneInput = qse(row, '.telefone')
    const orderInput = qse(row, '.order')
    const lensInput = qse(row, '.lens')

    const inputsToValidate = [
      { input: dateInput, message: 'PREENCHA A DATA' },
      { input: nameInput, message: 'PREENCHA O NOME DO CLIENTE' },
      { input: telefoneInput, message: 'PREENCHA O TELEFONE' },
      { input: orderInput, message: 'PREENCHA A ORDEM DE SERVIÇO' },
      { input: lensInput, message: 'PREENCHA A LENTE' }
    ]

    const regexData = /^\d{2}\/\d{2}\/\d{4}$/

    inputsToValidate.forEach(({ input, message }) => {
      if (input.classList.contains('date') && !regexData.test(input.value.trim())) {
        input.classList.add('error')
        input.value = ''
        input.placeholder = 'DATA INVÁLIDA'
        valid = false
      } else if (input.value.trim() === '') {
        input.classList.add('error')
        input.placeholder = message
        valid = false
      } else {
        input.classList.remove('error')
      }
    })

    if (!valid) return

    const novoAcomp = {
      date: dateInput.value.trim(),
      name: nameInput.value.trim(),
      telefone: telefoneInput.value.trim(),
      order: orderInput.value.trim(),
      lens: lensInput.value.trim(),
      concluido: false
    }

    if (editIndex !== null) {
      novoAcomp.concluido = acompanhamentos[editIndex].concluido || false
      acompanhamentos[editIndex] = novoAcomp
    } else {
      acompanhamentos.push(novoAcomp)
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
  a.download = `backup_lentes_${new Date().toISOString().slice(0,10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

qs('#btnBackup').addEventListener('click', fazerBackup)
