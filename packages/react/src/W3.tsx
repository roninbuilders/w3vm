import { useEffect } from 'react'
import { Connector, initEIP6963, setW3, _storedWalletExists } from '@w3vm/core'
import { KEY_WALLET } from './constants'

let init = 0

export function W3({ connectors }: { connectors?: Connector[] }): null {
	useEffect(() => {
		if (init === 0 && connectors) {
			initEIP6963()
			for (let w of connectors) w.init()

			if (!localStorage.getItem(KEY_WALLET)) {
				setW3.status(undefined)
			} else {
				setTimeout(_storedWalletExists, 1000)
			}
		}

		// This component must be mounted only once in the whole application's lifecycle
		return () => {
			init = 1
		}
	}, [])

	return null
}
