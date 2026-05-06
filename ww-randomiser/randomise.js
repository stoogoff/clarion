
import fs from 'node:fs'
import csv from 'csv-parser'
import { shuffle, repeat } from './array.js'

/**
 * convert our input CSV data to
 * {
 * 	x: [A, A, A, B, B]
 *  y: [A, B, B, C, C]
 * }
 * Where x and y are the roles (CSV headers) and
 * A, B, and C are the names of the participants
 */
function convertData(input) {
	const slots = Object.keys(input[0])
		.filter(i => i !== 'Name')
		.reduce((a, c) => ({ ...a, [c]: [] }), {})

	const choices = ["", 150, 70, 50, 40, 30, 25, 20, 15, 12, 9, 5, 4, 3, 2, 1]

	input.forEach(record => {
		Object.keys(slots).forEach(key => {
			const values = repeat(record.Name, choices[parseInt(record[key])])

			slots[key] = [...slots[key], ...values]
		})
	})

	return slots
}

const records = []

fs.createReadStream('input.csv')
	.pipe(csv())
	.on('data', data => records.push(data))
	.on('end', () => {
		const slots = convertData(records)
		// shuffle the roles so the order we pick for each is random
		const keys = shuffle(Object.keys(slots))
		const picked = {}

		for(let i = 0, len = keys.length; i < len; ++i) {
			// randomise all of the choices then take the first one
			const chosen = shuffle(slots[keys[i]])[0]

			picked[keys[i]] = chosen

			// remove the chosen one from all future iterations
			for(let j = i; j < len; ++j) {
				slots[keys[j]] = slots[keys[j]].filter(peep => peep !== chosen)
			}
		}

		Object.keys(picked).sort().forEach(key => {
			const choice = records.find(({ Name }) => Name === picked[key])

			console.log(`${key}: ${picked[key]} (${choice[key]})`)
		})
	})

