import { useEffect, useState } from 'react'

export default function App() {
	const [currAmount, setCurrAmount] = useState('')
	const [result, setResult] = useState('')
	const [fromAmount, setFromAmount] = useState('USD')
	const [toAmount, setToAmount] = useState('EUR')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const [message, setMessage] = useState('')

	useEffect(
		() => {
			const controller = new AbortController()
			const signal = controller.signal

			const countCurrency = (rate) => {
				try {
					if (currAmount !== 0 && currAmount !== '') {
						const amountOfCurr = +currAmount;
						const sumResult = (rate * amountOfCurr).toFixed(2);
						setResult(sumResult);
					}
				} catch (err) {
					console.error('Error setting result:', err);
				}
			};

			const fetchCurrency = async () => {
				try {
					setIsLoading(true)
					setError('')

					const res = await fetch(
						`https://api.frankfurter.app/latest?from=${fromAmount}&to=${toAmount}`,
						{ signal }
					)

					if (fromAmount === toAmount) {
						setCurrAmount('')
						setResult('')
						setMessage('The currency must be defferent!!!')
					} else {
						setMessage('')
					}

					if (!res.ok) throw new Error('Fetching currency failed. ')

					const data = await res.json()
					if (data.error) throw new Error(data.error)

					const rate = Number(data.rates[toAmount].toFixed(2))
					countCurrency(rate)
				} catch (err) {
					if (err.name !== 'AbortError') {
						setError(err.message)
					}
				} finally {
					setIsLoading(false)
				}
			}

			fetchCurrency()

			return () => controller.abort()
		}, [fromAmount, toAmount, result, currAmount])

	return (
		<div>
			<input
				type="text"
				value={currAmount}
				onChange={(e) => setCurrAmount(e.target.value)}
				placeholder="enter your sum"
			/>

			<select value={fromAmount} onChange={(e) => setFromAmount(e.target.value)}>
				<option value="USD">USD</option>
				<option value="EUR">EUR</option>
				<option value="CZK">CZK</option>
				<option value="PLN">PLN</option>
			</select>

			<select value={toAmount} onChange={(e) => setToAmount(e.target.value)}>
				<option value="USD">USD</option>
				<option value="EUR">EUR</option>
				<option value="CZK">CZK</option>
				<option value="PLN">PLN</option>
			</select>

			<p>{result} {message ? '' : currAmount && <span>{toAmount}</span>}</p>
			<p>{isLoading && <span>...Loading</span>} {error} {message}</p>
		</div>
	)
}
