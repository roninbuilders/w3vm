import { useEffect, useRef } from 'react'
import { Connector, initEIP6963, w3vmStore, _storedWalletExists } from '@w3vm/core'
import { KEY_WALLET } from './constants'

export function W3({ connectors }: { connectors?: Connector[] }): null {
	const active = useRef(true)

	useEffect(() => {
		if (active.current && connectors) {
			initEIP6963()
			for (let w of connectors) w.init()

			if (!localStorage.getItem(KEY_WALLET)) {
				w3vmStore.set('status', undefined)
			} else {
				setTimeout(_storedWalletExists, 1000)
			}
		}

		// This component must be mounted only once in the whole application's lifecycle
		return () => {
			active.current = false
		}
	}, [])

	return null
}
