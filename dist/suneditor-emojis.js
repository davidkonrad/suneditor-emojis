/*
 * suneditor-emojis.js
 * Emojis plugin for SunEditor
 * Copyright 2025 David Konrad.
 * MIT license.
 */

"use strict";

const Emojis = (function() {	// eslint-disable-line no-unused-vars
	const storage_favorite = 'suneditor-emojis-fav'
	const storage_supported = 'suneditor-emojis-sup'
	const storage_disabled = false
	const emojis = {}
	let supported_cache = {}
	let emoji_width = undefined

	const init = function() {
		return new Promise(function(resolve) {
			fetchSupported()
			fetchEmojis().then(function() {
				resolve(emojis)
			})
		})
	}

	const parse = function(s) {
		try {
			return JSON.parse(s)
		} catch(e) {
			return false
		}
	}

	const registerEmoji = function(emoji) {
		for (const e in emojis['']) {
			if (emojis[''][e].emoji === emoji) return false
		}
		const obj = getEmoji(emoji)
		emojis[''].push(obj)
		localStorage.setItem(storage_favorite, JSON.stringify(emojis['']))		
		return true
	}

	const getRegistered = function() {
		let r = localStorage.getItem(storage_favorite)
		r = parse(r)
		if (!r) {
			resetRegistered()
			return []
		}
		return r
	}

	const resetRegistered = function() {
		emojis[''] = []
		localStorage.setItem(storage_favorite, JSON.stringify(emojis['']))	
	}

	const fetchSupported = function() {
		if (storage_disabled) return {}
		const s = localStorage.getItem(storage_supported)
		supported_cache = s ? JSON.parse(s) : {}
	}

	const registerSupported = function(emoji, supported) {
		if (!emoji) return
		supported_cache[emoji] = supported
		if (storage_disabled) return 
		localStorage.setItem(storage_supported, JSON.stringify(supported_cache))	
	}

	const testFallback = function(emoji) {
		const s = document.body.appendChild(document.createElement('span'))
		s.classList.add('se-emoji')
		s.appendChild(document.createTextNode(emoji))
		const res = parseFloat(s.offsetWidth)
		s.parentNode.removeChild(s)
		return res
	}

	window.addEventListener('load', function() {
		emoji_width = testFallback('😀')
	})

	const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })

	//0: not supported, 1: supported, 2: fallback
	const isSupported = function(emoji) {
		if (emoji in supported_cache) return supported_cache[emoji]
		const canRender = function() {
			ctx.canvas.width = ctx.canvas.height = 1
			ctx.fillText(emoji, -4, 4)
			return ctx.getImageData(0, 0, 1, 1).data[3] > 0
		}
		const isNativeCompound = function() {
			const t = Array.from(emoji)
			if (t.length === 1) return false
			let c = 0
			for (const e of t) {
				if (/\p{Emoji}/u.test(e)) c++
			}
			return c > 2
		}
		let res = 1
		if (canRender()) {
			if (testFallback(emoji) > emoji_width) {
				res = isNativeCompound(emoji) ? 1 : 2
			}
		} else {
			res = 0
		}
		registerSupported(emoji, res)
		return res
	}

	const getEmoji = function(emoji) {
		for (const t in emojis) {
			if (t !== '') for (const i in emojis[t]) {
				const e = emojis[t][i]
				if (e.emoji === emoji) {
					return e
				}
			}
		}
		return false
	}

	const getPath = function() {
		const path = document.currentScript.src.split('/')
		//module:
		//const path = import.meta.url.split('/')
		path.pop()
		return path.join('/')
	}

	const parseEmojis = function(response) {
		const fixProp = function(emoji, from, to) {
			emoji[to] = emoji[from]
			delete emoji[from]
		}
		return new Promise(function(resolve) {
			const r = JSON.parse(response)
			const first = !Object.keys(supported_cache).length
			emojis[''] = getRegistered()
			for (const type in r) {
				emojis[type] = r[type]
				emojis[type].forEach(function(emoji) {
					fixProp(emoji, 'n', 'name')
					fixProp(emoji, 'e', 'emoji')
					fixProp(emoji, 's', 'skintone')
					if (first) isSupported(emoji.emoji)
				})
			}
			resolve(true)
		})
	}

	const skinTones = {
		neutral: '',
		light: 0x1F3FB,
		mediumLight: 0x1F3FC,
		medium: 0x1F3FD,
		mediumDark: 0x1F3FE,
		dark: 0x1F3FF
	}

	function toSkinTone(emoji, tone) {
		emoji = emoji.replaceAll(/[\u{1F3FB}-\u{1F3FF}]/ug, '') 
		const modifiable = /\p{Emoji_Modifier_Base}/ug
		let toned = ''
		for (const c of emoji) {
			if (c !== 0xFE0F) {
				toned += c
				if (modifiable.test(c)) {
					toned += String.fromCodePoint(skinTones[tone])
				}
			}
		}
		return toned
	}

	const fetchEmojis = function() {
		return new Promise(function(resolve) {
			try {
				fetch(getPath() + '/data-by-group.min.json', {
					method: 'GET',
					headers: { 'Accept': 'application/json' }
				})
				.then(response => response.text())
				.then(response => resolve(parseEmojis(response)))
			} catch(error) {
				console.log('fetchEmojis', error)
				resolve(error)
			}
		})
	}

	return {
		init,
		emojis,
		getEmoji,
		isSupported,
		registerEmoji,
		getRegistered,
		resetRegistered,
		toSkinTone,
		skinTones: Object.keys(skinTones),
	}

})();
Emojis.init();
const emojis = (function(Emojis) {	// eslint-disable-line no-unused-vars
	const name = 'emojis'
	const display = 'submenu'
	const innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" id="smiley"><path fill="#444" d="M8 1c3.9 0 7 3.1 7 7s-3.1 7-7 7-7-3.1-7-7 3.1-7 7-7zm0-1C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z"></path><path fill="#444" d="M8 13.2c-2 0-3.8-1.2-4.6-3.1l.9-.4c.6 1.5 2.1 2.4 3.7 2.4s3.1-1 3.7-2.4l.9.4c-.8 2-2.6 3.1-4.6 3.1zM7 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM11 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"></path></svg>'
	const title = 'Insert Emojis'

	const topmenu_name = 'se-emojis-menu'
	const recent_name = 'se-emojis-recent'
	const result_name = 'se-emojis-result'
	const default_groups = [
		'Smileys & Emotion', 
		'Activities', 
		'Animals & Nature', 
		'Flags', 
		'Food & Drink', 
		'Objects', 
		'People & Body', 
		'Symbols', 
		'Travel & Places'
	]

	let _core = undefined
	let options = {
		groups: default_groups.slice(),
		captions: default_groups.slice(),
		showRecent: true,
		iconSize: '1.5rem',
		skinTone: 'neutral',
		topmenu: {
			search: false,
			skinTone: false,
			iconSize: false,
			recent: false
		},
		showFallbacks: false,
		tagName: 'span'
	}
	const default_options = Object.assign({}, options)

	//Emojis.init()

	const add = function(core, targetElement) {
		_core = core
		options = Object.assign({}, default_options, _core.options.emojis)
		let listDiv = setSubmenu.call(core)
		const topmenu = listDiv.querySelector('div[name="' + topmenu_name + '"]')
		populateEmojis(listDiv)
		setTopmenu(topmenu)
		core.initMenuTarget(name, targetElement, listDiv)
		if (options.height) {
			document.querySelector('.se-emojis').style.height = options.height
			document.querySelector('.se-emojis-layer').style.overflowY = 'hidden'
		}
		if (options.width) document.querySelector('.se-emojis').style.width = options.width
		if (options.showRecent) {
			updateRecent(listDiv)
			if (topmenu) {
				setTimeout(function() {
					listDiv.querySelector('div[name="' + recent_name + '"]').style.marginTop = topmenu.offsetHeight + 'px'
				})
			}
		}
	}

	const setSubmenu = function() {
		const topmenu = options.topmenu && (options.topmenu.search || options.topmenu.iconSize || options.topmenu.skinTone)
		let listDiv = this.util.createElement('div')
		listDiv.className = 'se-submenu se-list-layer se-emojis-layer'
		listDiv.style.paddingTop = 0
		let html = '<div class="se-list-inner">'
		html += '<div class="se-emojis">'
		if (topmenu) {
			html += `<div name="${topmenu_name}" class="topmenu"></div>`
		}
		if (options.showRecent) {
			html += `<div name="${recent_name}" class="se-emojis-recent"></div>`
		}
		if (topmenu && options.topmenu.search) {
			html += `<div name="${result_name}" class="se-emojis-group se-emojis-result" style="font-size:${options.iconSize};"></div>`
		}
		if (options.captions) {
			for (const [i,group] of options.groups.entries()) {
				if (default_groups.includes(group)) {
					html += `<div class="se-emojis-group" style="font-size:${options.iconSize};">`
					if (options.captions[i]) {
						html += `<header>${options.captions[i]}</header>`
					}
					html += `<div name="${group}"></div></div>`
				} else {
					console.warn('group "'+ group + '" is not valid')
				}
			}
		} else {
			html += `<div class="se-emojis-group" style="font-size:${options.iconSize};"><div name="emojis"></div></div>`
		}
		listDiv.innerHTML = html 
		return listDiv
	}

	//hack to fix "last flex row should be left aligned" problem
	const fixLastRow = function(cnt) {
		for (let i=0; i<9; i++) { 
			cnt.insertAdjacentHTML('beforeend', '<span style="flex:1;"></span>')
		}
	}

	const populateEmojis = function(listDiv) {
		const reset = typeof listDiv === 'undefined'
		listDiv = listDiv || document.querySelector('.se-emojis-layer')
		if (options.captions) {
			//let start = window.performance.now()
			for (let group of options.groups) {
				const cnt = listDiv.querySelector('div[name="' + group + '"]')
				if (reset && cnt) cnt.innerText = ''
				if (Emojis.emojis[group] && Emojis.emojis[group].length) {
					Emojis.emojis[group].forEach(function(emoji) {
						if (emoji && cnt) createBtn(emoji, cnt)
					})
					fixLastRow(cnt)
				} else {
					console.log(`error: emoji does not exist for type '${group}'`)
				}
			}
			//let end = window.performance.now()
			//let time = end - start
			//console.log(time)
		} else {
			const cnt = listDiv.querySelector('div[name="emojis"]')
			if (reset && cnt) cnt.innerText = ''
			for (let group of options.groups) {
				if (Emojis.emojis[group] && Emojis.emojis[group].length) {
					Emojis.emojis[group].forEach(function(emoji) {
						if (emoji && cnt) createBtn(emoji, cnt)
					})
				} else {
					console.log(`error: emoji does not exist for type '${group}'`)
				}
			}
			fixLastRow(cnt)
		}
	}

	const updateRecent = function(listDiv) {
		const reset = typeof listDiv === 'undefined'
		listDiv = listDiv || document.querySelector('.se-emojis-layer')
		const cnt = listDiv.querySelector('.se-emojis div[name="' + recent_name + '"]')
		if (reset) cnt.innerText = ''
		if (Emojis.emojis && Emojis.emojis['']) Emojis.emojis[''].forEach(function(emoji) {
			createBtn(emoji, cnt)
		})
		updateClearRecent(cnt)
	}

	const setTopmenu = function(cnt) {
		cnt = cnt || document.querySelector('.se-emojis div[name="' + topmenu_name + '"]')
		if (!cnt) return
		cnt.innerText = ''

		const initIconSize = function() {
			let html = '<span class="btn-iconsize" data-type="+" title="increase icon size">➕</span><span class="btn-iconsize" data-type="-" title="decrease icon size">➖</span>'
			cnt.insertAdjacentHTML('beforeEnd', '<div class="topmenu-item">' + html + '</div>')
			setTimeout(function() {
				cnt.querySelectorAll('.btn-iconsize').forEach(function(btn) {
					btn.onclick = function() {
						let fs = parseFloat(options.iconSize)
						const u = options.iconSize.replace(fs, '')
						fs = btn.getAttribute('data-type') === '+' ? (fs + 0.2) : (fs - 0.2) //TODO: implement step option
						fs+= u
						document.querySelectorAll('.se-emojis .se-emojis-group').forEach(function(group) {
							group.style.fontSize = fs
						})
						options.iconSize = fs
					}
				})
			})
		}

		const initSearch = function() {
			const glass = '  🔍'
			const html = `<div class=""><input class="se-emojis-search" type="search" placeholder="${glass}" dir="rtl" max-length="7" size="7" spellcheck="false"></div>`
			cnt.insertAdjacentHTML('beforeEnd', html)
			const input = cnt.querySelector('.se-emojis-search')
			input.onclick = function() {
				input.removeAttribute('dir')
				input.placeholder = ''
				if (input.value) search(this.value)
			}
			input.onsearch = function() {
				if (!input.value) {
					input.setAttribute('dir', 'rtl')
					input.placeholder = glass
				}
				input.blur()
				endSearch()
			}
			input.onblur = input.onsearch
			input.onkeyup = function() {
				if (!this.value) {
					input.setAttribute('dir', 'rtl')
					input.placeholder = glass
				}
				search(this.value)
			}
		}

		const initSkinTone = function() {
			let html = ''
			const person = '👍'
			for (const st of Emojis.skinTones.slice().reverse()) {
				const a =	st === options.skinTone ? ' btn-skintone-active' : ''
				let title = st.replace(/([A-Z])/g, ' $1').toLowerCase()
				html += '<span title="Skintone ' + title + '" class="btn-skintone' + a + '" data-skintone="' + st + '" >' + Emojis.toSkinTone(person, st) + '</span>'
			}
			cnt.insertAdjacentHTML('beforeEnd', '<div class="topmenu-item">' + html + '</div>')
			cnt.querySelectorAll('.btn-skintone').forEach(function(btn) {
				btn.onclick = function() {
					endSearch()
					options.skinTone = this.getAttribute('data-skintone')
					populateEmojis()
					setTopmenu(cnt)
				}
			})
		}

		for (const t in options.topmenu) {
			if (options.topmenu[t] === true) switch(t) {
				case 'iconSize' : 
					initIconSize()
					break
				case 'skinTone' : 
					initSkinTone()
					break
				case 'search' : 
					initSearch()
					break
				default :
					break
			}
		}
		
		setTimeout(function() {
			cnt.style.width = getComputedStyle(document.querySelector('.se-emojis')).width
		}, 50)

	}

	const beginSearch = function(term) {
		const res = document.querySelector('div[name="' + result_name + '"]')
		res.innerHTML = '<header><q>' + term + '</q></header><div></div>'
		res.style.display = 'block'
		document.querySelectorAll('.se-emojis-group').forEach(function(div) {
			div.style.display = 'hidden'
		})
		document.querySelector('.se-emojis-layer').scrollTop = 0
	}

	const endSearch = function() {
		document.querySelectorAll('.se-emojis-group').forEach(function(div) {
			div.style.display = 'block'
		})
		const res = document.querySelector('div[name="' + result_name + '"]')
		if (!res) return
		res.innerText = ''
		res.style.display = 'none'
	}

	const search = function(term) {
		if (term) {
			beginSearch(term)
			term = term.toLowerCase()
		} else {
			endSearch()
			return
		}
		const cnt = document.querySelector('div[name="' + result_name + '"] div')
		const exists = function(emoji) {
			const btns = cnt.querySelectorAll('.btn-emoji')
			for (const btn of btns) {
				if (btn.querySelector('span').getAttribute('data-emoji') === emoji) return true
			}
		}
		for (let type in Emojis.emojis) {
			Emojis.emojis[type].forEach(function(emoji) {
				if (emoji && emoji.name.toLowerCase().indexOf(term) > -1) {
					if (exists(emoji.emoji) !== true) createBtn(emoji, cnt)
				}
			})
		}
		if (cnt.innerText === '') {
			cnt.innerHTML = '<small>... &nbsp;</small>'
		} else {
			fixLastRow(cnt)
		}
	}

	const updateClearRecent = function(cnt) {
		if (!cnt || cnt.innerText === '') return
		const btn = document.createElement('i')
		btn.classList.add('clear-recent')
		btn.title = 'Clear recent'
		btn.innerHTML = '&times;'
		btn.onclick = function() {
			Emojis.resetRegistered()
			updateRecent()
		}
		cnt.appendChild(btn)			
	}

	const createBtn = function(emoji, cnt) {
		switch (Emojis.isSupported(emoji.emoji)) {
			case 0 :
				return
			case 1 : 
				break
			case 2 :
				if (!options.showFallbacks) return
				break
			default:
				break
		}				
		const btn = document.createElement('button')
		const render = emoji.skintone && options.skinTone !== 'neutral'
			? Emojis.toSkinTone(Object.assign({}, emoji).emoji, options.skinTone)
			: emoji.emoji
		const name = emoji.name.charAt(0).toUpperCase() + emoji.name.slice(1)
		btn.className = 'btn-emoji'
		btn.type = 'button'
		btn.title = name
		btn.innerHTML = '<span class="emoji" data-emoji="' + emoji.emoji + '">' + render + '</span>'
		btn.addEventListener('click', onClick.bind())
		cnt.appendChild(btn)
	}

	const onClick = function(e) {
		const span = e.target.querySelector('span')
		const value = span.innerText
		const org = span.getAttribute('data-emoji')
		if (typeof options.tagName === 'string' && options.tagName !== '') {
			_core.functions.insertHTML(`<${options.tagName} class="se-emoji">${value}</${options.tagName}>&zwj;`, true, true)
		} else {
			_core.functions.insertHTML(value, true)
		}
		if (options.showRecent) {
			if (Emojis.registerEmoji(org)) {
				updateRecent()
			}
		}
	}

	return {
		name: name,
		display: display,
		innerHTML: innerHTML,
		title: title,
		add: add,
	}

})(Emojis);

