/*
 * Emojis plugin for SunEditor, wysiwyg web editor
 *
 * Copyright 2025 David Konrad.
 * MIT license.
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */


"use strict";

const Emojis = (function(window, document) {
	const storage_favorite = 'suneditor-emojis-fav'
	const storage_supported = 'suneditor-emojis-sup'
	const __fav__ = ''
	const emojis = {}
	let supported_cache = {}

	const init = function() {
		fetchSupported()
		fetchEmojis()
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
		const s = localStorage.getItem(storage_supported)
		supported_cache = s ? JSON.parse(s) : {}
	}

	const registerSupported = function(emoji, supported) {
		if (!emoji) return
		supported_cache[emoji] = supported
		localStorage.setItem(storage_supported, JSON.stringify(supported_cache))	
	}

	const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })

	const isSupported = function(emoji) {
		if (emoji in supported_cache) return supported_cache[emoji]
		ctx.canvas.width = ctx.canvas.height = 1
		ctx.fillText(emoji, -4, 4)
		const res = ctx.getImageData(0, 0, 1, 1).data[3] > 0
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
	}

	const getPath = function() {
		let path = document.currentScript.src.split('/')
		path.pop()
		path = path.join('/')
		return path
	}

	const parseEmojis = function(response) {
		const fixProp = function(emoji, from, to) {
			emoji[to] = emoji[from]
			delete emoji[from]
		}
		const r = JSON.parse(response)
		emojis[''] = getRegistered()
		for (const type in r) {
			emojis[type] = r[type]
			emojis[type].forEach(function(emoji) {
				fixProp(emoji, 'n', 'name')
				fixProp(emoji, 'e', 'emoji')
				fixProp(emoji, 's', 'skintone')
			})
		}
	}

	const skinTones = new Map([
		['neutral', ''],
		['light', '🏻'],
		['mediumLight', '🏼'],
		['medium', '🏽'],
		['mediumDark', '🏾'],
		['dark', '🏿']
	])

/*
	const skintones = {
		1: '\u{1F3FB}', //light
    2: '\u{1F3FC}', //mediumLight
    3: '\u{1F3FD}', //medium
    4: '\u{1F3FE}', //mediumDark
    5: '\u{1F3FF}'  //dark
  };
*/

	function skinTone(emoji, tone) {
		emoji = emoji.replaceAll(/[\u{1F3FB}-\u{1F3FF}]/ug, '')

		// This emoji modifier base is present in emojis that the skin tone can apply to.
		const emojiBaseModifierRegex = /\p{Emoji_Modifier_Base}/ug
		const emojiPresentationSelector = '\u{FE0F}'

		// If tone is `'none'`, the emoji has more than two modifiable components, or it is a two-person family emoji, then skin tone should not be applied.
		if (tone === 'none') {
			return emoji
		}

		let processedEmoji = ''

		for (const codePoint of emoji) {
			// If this code point is a emoji presentation selector, it should not be added to toned emoji.
			if (codePoint === emojiPresentationSelector) {
				continue;
			}

			processedEmoji += codePoint;
			// Tone should be applied to all modifiable components.
			// For example, both persons in couple emojis, etc.
			if (emojiBaseModifierRegex.test(codePoint)) {
				processedEmoji += skinTones.get(tone)
			}
		}
		//console.log('skintone ok')
		return processedEmoji
	}

	const fetchEmojis = function() {
		const xhr = new XMLHttpRequest()
		xhr.onreadystatechange = function() {
			if (xhr.readyState === XMLHttpRequest.DONE) {
				switch (xhr.status) {
					case 200 :
						parseEmojis(xhr.responseText)
						break
					case 404 : 
					default :
						console.log('file not found')
						break
				}
			}
		}
		xhr.open('GET', getPath() + '/data-by-group.16.min.json', true)
		xhr.send()
	}

	return {
		init,
		getEmoji,
		isSupported,
		registerEmoji,
		getRegistered,
		resetRegistered,
		skinTone,
		skinTones,
		emojis
	}

})(window, document)

Emojis.init()

"use strict";

const emojisPlugin = (function() {
	const name = 'emojis'
	const display = 'submenu'
	const innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" id="smiley"><path fill="#444" d="M8 1c3.9 0 7 3.1 7 7s-3.1 7-7 7-7-3.1-7-7 3.1-7 7-7zm0-1C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z"></path><path fill="#444" d="M8 13.2c-2 0-3.8-1.2-4.6-3.1l.9-.4c.6 1.5 2.1 2.4 3.7 2.4s3.1-1 3.7-2.4l.9.4c-.8 2-2.6 3.1-4.6 3.1zM7 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM11 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"></path></svg>'
	const title = 'Indsæt smileys / emojis'
	const topmenu_name = 'se-emojis-menu'
	const fav_name = 'se-emojis-fav'
	const result_name = 'se-emojis-result'
	const default_sections = [
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

	let options = {
		sections: default_sections.slice(),
		names: default_sections.slice(),
		favorites: true,
		iconSize: '1.5rem',
		skinTone: 'neutral',
		topmenu: {
			search: false,
			skinTone: false,
			iconSize: false
		}
	}

	let _core = undefined

	const add = function(core, targetElement) {
		_core = core
		if (core.options.emojis) options = Object.assign({}, options, core.options.emojis)
		console.log(options)
		let listDiv = setSubmenu.call(core)
		setTopmenu(listDiv.querySelector('div[name="' + topmenu_name + '"]'))
		core.initMenuTarget(name, targetElement, listDiv)
/*
		setTimeout(function() {
			listDiv.style.height = '20rem'
			listDiv.style.width = '60rem'		
			listDiv.style.resize = 'both'
		}, 50)
*/
		//listDiv.style.maxHeight = '400px'
		//listDiv.style.resize = 'both'
		//listDiv.setAttribute('resize', 'both')
	}

	const setSubmenu = function(core) {
		let listDiv = this.util.createElement('div')
		listDiv.className = 'se-submenu se-list-layer se-emojis-layer'
		listDiv.style.paddingTop = 0
		//listDiv.resize = 'both'

		if (options.favorites) {
			options.sections.unshift('')
			options.names.unshift('')
		}

		//const width = ('width' in options) ? options.width : '30rem'
		
		//let html = '<div class="se-list-inner" style="position:relative;min-width:' + width + ';padding-left:3px;top:-5px;">'
		let html = '<div class="se-list-inner" XXstyle="margin-top:2rem;"Xstyle="position:relative;padding-left:3px;top:-5px;">'
		html += '<div class="se-emojis">'
		
		html += '<div>'
		html += '<div name="' + topmenu_name + '" class="topmenu"></div>'
		html += '</div>'

		html += '<div style="display:block;float:left;XXmargin-top:2rem;">'
		html += '<div name="' + result_name + '">'
		html += '</div>'

		for (const [i,sec] of options.sections.entries()) {
			html += '<div style="display:block;float:left;Xwidth:100%;Xmin-width:100%;">'
			if (sec !== '') html += '<header>' + options.names[i] + '</header>'
			html += '<div name="' + (sec || fav_name) + '" style="display:inner-block;float:left;"></div>'
			html += '</div>'
		}

		html += '</div>'
		listDiv.innerHTML = html 

		populateEmojis(listDiv)
		updateClearFav(listDiv)

		return listDiv
	}

	const populateEmojis = function(listDiv) {
		const reset = typeof listDiv === 'undefined'
		listDiv = listDiv || document.querySelector('.se-emojis-layer')
		for (let type in Emojis.emojis) {
			const cnt = listDiv.querySelector('div[name="' + (type || fav_name) + '"]')
			if (reset) cnt.innerText = ''
			if (Emojis.emojis[type] && Emojis.emojis[type].length) {
				Emojis.emojis[type].forEach(function(emoji) {
					if (cnt && emoji) {
						//createBtn(emoji.emoji, emoji.name, cnt)
						createBtn(emoji, cnt)
/*
						if (emoji.skintone && options.skinTone !== 'neutral') {
							createBtn(Emojis.skinTone(emoji.emoji, options.skinTone), emoji.name, cnt)
						} else {
							createBtn(emoji.emoji, emoji.name, cnt)
						} 
*/
					} else {
						//console.log('err', emoji, type)
					}
				})
			} else {
				console.log( typeof emoji === 'undefined' 
					? 'emoji is undefined'
					: `error: type:${type}, emoji:${emoji || 'undefined'}`
				)
			}
		}
	}

	const setTopmenu = function(cnt) {
		cnt.innerText = ''
		if (!options.topmenu) {
			cnt.style.display = 'none'
			return
		}
		if (options.topmenu.iconSize) {
			let html = '<span class="btn-iconsize" data-type="+" title="increase icon size">➕</span><span class="btn-iconsize" data-type="-" title="decrease icon size">➖</span>'
			cnt.insertAdjacentHTML('beforeEnd', '<div style="font-size:small;">' + html + '</div>')
			setTimeout(function() {
				cnt.querySelectorAll('.btn-iconsize').forEach(function(btn) {
					btn.onclick = function() {
						let current = !options.iconSize
							? parseFloat(getComputedStyle(document.querySelector('.se-emojis').querySelector('.btn-emoji')).fontSize)
							: parseFloat(options.iconSize)
						current = btn.getAttribute('data-type') === '+' ? current + 3 : current - 3
						options.iconSize = current + 'px'
						document.querySelector('.se-emojis').querySelectorAll('.btn-emoji').forEach(function(btn) {
							btn.style.fontSize = options.iconSize
						})
					}
				})
			})
		}

		if (options.topmenu.search) {
			cnt.insertAdjacentHTML('beforeEnd', '<div class=""><input class="se-emojis-search" type="search" placeholder="🔎" dir="rtl" style="width:80%;"></div>')
			const input = cnt.querySelector('.se-emojis-search')
			input.onclick = function() {
				input.removeAttribute('dir')
				input.placeholder = ''
			}
			input.onkeydown = input.onclick
			input.onsearch = function() {
				input.setAttribute('dir', 'rtl')
				input.placeholder = '🔎'
				endSearch()
			}
			input.onkeyup = function() {
				if (!this.value) {
					input.setAttribute('dir', 'rtl')
					input.placeholder = '🔎'
				}
				search(this.value)
			}
		}

		if (options.topmenu.skinTone) {
			let html = ''
			const person = '👧' //'🧑'
			for (let [key, value] of Emojis.skinTones) {
				const a =	key === options.skinTone ? ' btn-skintone-active' : ''
			  let title = key.replace(/([A-Z])/g, ' $1').toLowerCase()
				html += '<span title="Skintone ' + title + '" class="btn-skintone' + a + '" data-skintone="' + key + '" >' + Emojis.skinTone(person, key) + '</span>'
			}
			cnt.insertAdjacentHTML('beforeEnd', '<div class="">' + html + '</div>')
			cnt.querySelectorAll('.btn-skintone').forEach(function(btn) {
				btn.onclick = function() {
					endSearch()
					options.skinTone = this.getAttribute('data-skintone')
					populateEmojis()
					setTopmenu(cnt)
				}
			})
		}

		setTimeout(function() {
			cnt.style.width = getComputedStyle(document.querySelector('.se-emojis')).width
		}, 50)
	}

	const beginSearch = function() {
		const res = document.querySelector('div[name="' + result_name + '"]')
		res.innerHTML = ''
		res.style.display = 'block'
		for (const [i,sec] of options.sections.entries()) {
			document.querySelector('div[name="' + (sec || fav_name) + '"]').parentElement.style.visibility = 'hidden'
		}
	}

	const endSearch = function() {
		const res = document.querySelector('div[name="' + result_name + '"]')
		res.innerText = ''
		res.style.display = 'none'
		for (const [i,sec] of options.sections.entries()) {
			document.querySelector('div[name="' + (sec || fav_name) + '"]').parentElement.style.visibility = 'visible'
		}
	}

	const search = function(term) {
		if (term) {
			beginSearch()
			term = term.toLowerCase()
		} else {
			endSearch()
			return
		}
		const cnt = document.querySelector('div[name="' + result_name + '"]')
		for (let type in Emojis.emojis) {
			Emojis.emojis[type].forEach(function(emoji) {
				if (emoji && emoji.name.toLowerCase().indexOf(term) > -1) {
					//createBtn(emoji.emoji, emoji.name, cnt)
					createBtn(emoji, cnt)
				}
			})
		}
	}

	const updateClearFav = function(listDiv) {
		listDiv = listDiv || document.querySelector('.se-emojis-layer')
		const cnt = listDiv.querySelector('div[name="' + fav_name + '"]')
		if (!cnt || cnt.innerText === '') return
		cnt.querySelectorAll('button').forEach(function(btn) {
			btn.addEventListener('click', onClick.bind())
		})
		const btn = document.createElement('i')
		btn.classList.add('clear-favorites')
		btn.title = 'Clear favorites'
		btn.innerHTML = '&times;'
		btn.onclick = function() {
			Emojis.resetRegistered()
			updateFavorites()
		}
		cnt.appendChild(btn)			
	}

	const updateFavorites = function() {
		const cnt = document.querySelector('div[name="' + fav_name + '"]')
		cnt.innerText = ''
		if (Emojis.emojis && Emojis.emojis['']) Emojis.emojis[''].forEach(function(emoji) {
			//createBtn(emoji.emoji, emoji.name, cnt)
				createBtn(emoji, cnt)
		})
		updateClearFav(cnt)
	}

	const createBtn = function(emoji, cnt) {
		if (!Emojis.isSupported(emoji.emoji)) return
		const cp = emoji.emoji
		const btn = document.createElement('button')
		const render = emoji.skintone && options.skinTone !== 'neutral'
			? Emojis.skinTone(cp, options.skinTone)
			: emoji.emoji
		const name = emoji.name.charAt(0).toUpperCase() + emoji.name.slice(1)
		btn.className = 'btn-emoji'
		btn.type = 'button'
		btn.title = name
		btn.innerHTML = '<span class="emoji">' + render + '</span>'
		btn.addEventListener('click', onClick.bind())
		if (options.iconSize) btn.style.fontSize = options.iconSize
		cnt.appendChild(btn)
	}

	const onClick = function(e) {
		const value = e.target.querySelector('span').innerText
		_core.functions.insertHTML(value, true)
		if (options.favorites) {
			if (Emojis.registerEmoji(value)) {
				updateFavorites()
			}
		}
	}

	return {
		name: name,
		display: display,
		innerHTML: innerHTML,
		title: title,
		add: add
	}

})();


