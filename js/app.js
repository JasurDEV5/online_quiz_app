document
	.getElementById('fileInput')
	.addEventListener('change', function (event) {
		const file = event.target.files[0]
		if (file) {
			const reader = new FileReader()
			reader.onload = function (e) {
				const text = e.target.result
				parseQuestions(text)
			}
			reader.readAsText(file)
		}
	})

let allQuestions = []

document
	.getElementById('allQuestionsBtn')
	.addEventListener('click', () => displayQuestions(allQuestions))
document
	.getElementById('randomQuestionsBtn')
	.addEventListener('click', () => displayRandomQuestions())
document
	.getElementById('rangeQuestionsBtn')
	.addEventListener('click', () => displayQuestionsInRange())

function parseQuestions(text) {
	allQuestions = []
	const lines = text.split('\n')
	let currentQuestion = null
	let options = []

	lines.forEach(line => {
		line = line.trim()
		if (line.startsWith('?')) {
			if (currentQuestion) {
				allQuestions.push({ question: currentQuestion, options: options })
				options = []
			}
			currentQuestion = line.substring(1).trim()
		} else if (line.startsWith('+') || line.startsWith('-')) {
			const answerText = line.substring(1).trim()
			const isCorrect = line.startsWith('+')
			options.push({ text: answerText, isCorrect })
		}
	})

	if (currentQuestion) {
		allQuestions.push({ question: currentQuestion, options: options })
	}

	displayQuestions(allQuestions)
}

function displayQuestions(questions) {
	const questionsContainer = document.getElementById('questionsContainer')
	questionsContainer.innerHTML = '' // Clear any previous questions

	questions.forEach(q => {
		const questionElement = document.createElement('div')
		questionElement.className = 'question'
		questionElement.innerHTML = `<p>${q.question}</p>`

		shuffleArray(q.options)

		q.options.forEach(option => {
			const optionElement = document.createElement('div')
			optionElement.innerHTML = `
                <label>
                    <input type="radio" name="${q.question}" value="${option.isCorrect}"> ${option.text}
                </label>
            `
			questionElement.appendChild(optionElement)
		})

		questionsContainer.appendChild(questionElement)
	})

	const submitButton = document.createElement('button')
	submitButton.textContent = 'Yakunlash'
	submitButton.classList.add('btn_submit')
	submitButton.addEventListener('click', checkAnswers)
	questionsContainer.appendChild(submitButton)
}

function displayRandomQuestions() {
	const numberOfQuestions = parseInt(
		document.getElementById('randomQuestionsSelect').value,
		10
	)
	if (numberOfQuestions > allQuestions.length) {
		alert(`There are only ${allQuestions.length} questions available.`)
		return
	}

	const randomQuestions = []
	const usedIndexes = new Set()

	while (randomQuestions.length < numberOfQuestions) {
		const randomIndex = Math.floor(Math.random() * allQuestions.length)
		if (!usedIndexes.has(randomIndex)) {
			usedIndexes.add(randomIndex)
			randomQuestions.push(allQuestions[randomIndex])
		}
	}

	displayQuestions(randomQuestions)
}

function displayQuestionsInRange() {
	const from = parseInt(document.getElementById('rangeFrom').value, 10) - 1
	const to = parseInt(document.getElementById('rangeTo').value, 10) - 1
	if (
		isNaN(from) ||
		isNaN(to) ||
		from < 0 ||
		to >= allQuestions.length ||
		from > to
	) {
		alert('Please enter a valid range.')
		return
	}

	const questionsInRange = allQuestions.slice(from, to + 1)
	displayQuestions(questionsInRange)
}

function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[array[i], array[j]] = [array[j], array[i]]
	}
}

function checkAnswers() {
	const questionsContainer = document.getElementById('questionsContainer')
	const questions = questionsContainer.querySelectorAll('.question')
	let correctCount = 0
	let incorrectCount = 0

	questions.forEach(question => {
		const inputs = question.querySelectorAll('input[type="radio"]')
		let selectedAnswer = null
		let isCorrect = false

		inputs.forEach(input => {
			if (input.checked) {
				selectedAnswer = input
				isCorrect = input.value === 'true'
			}
		})

		const resultElement = document.createElement('div')
		resultElement.className = 'result'

		if (selectedAnswer) {
			if (isCorrect) {
				selectedAnswer.parentElement.classList.add('correct')
				// resultElement.textContent = 'To‘g‘ri!'
				correctCount++
			} else {
				selectedAnswer.parentElement.classList.add('incorrect')
				// resultElement.textContent = 'Noto‘g‘ri!'
				incorrectCount++

				// Highlight the correct answer
				inputs.forEach(input => {
					if (input.value === 'true') {
						input.parentElement.classList.add('correct')
					}
				})
			}
		} else {
			resultElement.textContent = 'Javob tanlangmagan!'
		}
		question.appendChild(resultElement)
	})

	const totalQuestions = questions.length
	const percentageCorrect = (correctCount / totalQuestions) * 100
	let points = 0

	if (percentageCorrect >= 85) {
		points = 5
	} else if (percentageCorrect >= 71) {
		points = 4
	} else if (percentageCorrect >= 56) {
		points = 3
	} else {
		points = 2
	}

	const resultSummary = document.createElement('div')
	resultSummary.className = 'result-summary'
	resultSummary.innerHTML = `
			<div class='total'>
				<p>To‘g‘ri javoblar: ${correctCount}</p>
				<p>Noto‘g‘ri javoblar: ${incorrectCount}</p>
				<p class='percentage'>To‘g‘ri javoblar foizi: ${percentageCorrect.toFixed(2)}%</p>
				<p class='points'>Baho : ${points}</p>
			</div>
    `
	questionsContainer.appendChild(resultSummary)
}
