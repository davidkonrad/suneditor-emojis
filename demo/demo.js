"use strict";

const Tests = [
	{ 
		desc: 'Default initialization',
		options: undefined
	},
	{ 
		desc: 'Smileys and flags only',
		options: {
			favorites: false,
			iconSize: '1.5rem',
			sections: ['Smileys & Emotion', 'Flags'],
			names: ['Emojis', 'Flags']
		}
	},
	{ 
		desc: 'Topmenu with search and skinetone',
		options: {
			topmenu: {
				search: true,
				skinTone: true
			}
		}
	},
]

const Demo = (function() {
	let editor = undefined
	
	const init = function() {
		const sel = document.getElementById('test-select')
		Tests.forEach(function(test) {
			const opt = document.createElement('option')
			opt.innerText = test.desc
			sel.appendChild(opt)
		})
		sel.onchange = function() {
			const h2 = document.getElementById('test-desc')
			Tests.forEach(function(test) {
				if (test.desc === sel.value) {
					h2.innerText = test.desc
					initEditor(test.options)
				}
			})
		}
		sel.selectedIndex = 1
		sel.dispatchEvent(new Event('change'))
	}

	const getDefaults = function() {
		const sections = ['Smileys & Emotion', 'Activities', 'Animals & Nature', 'Flags', 'Food & Drink', 'Objects', 'People & Body', 'Symbols', 'Travel & Places']
		return {
			sections: sections.slice(),
			names: sections.slice(),
			favorites: true,
			iconSize: '1.5rem',
			skinTone: 'neutral',
			topmenu: {
				search: false,
				skinTone: false,
				iconSize: false
			}
		}
	}

	const initEditor = function(opt) {
		const options = {
			mode: 'classic',
			width: '100%',
			height: 'auto',
			minHeight : '40vh',
			plugins: [emojisPlugin],
			buttonList: [
				['font', 'fontSize', 'formatBlock'], ['emojis'],
				['bold', 'underline', 'italic', 'strike', 'removeFormat'],
				['fontColor', 'hiliteColor'], 
			],
			lang: SUNEDITOR_LANG['en'],
		}
		options.emojis = opt ? Object.assign({}, getDefaults(), opt) : getDefaults()
		if (editor) editor.destroy()
		editor = SUNEDITOR.create('editor', options)
		document.querySelector('.sun-editor-editable').focus()
		let s = ''
		if (opt) {
			const obj = { emojis: opt }
			s = JSON.stringify(obj, null, '  ')
			s = s.replace(/\\/g, '')
			s = s.replace(/"([^"]+)":/g, '$1:') //https://stackoverflow.com/a/11233515/1407478
			s = s.substr(1, s.length - 2)
		}
		document.getElementById('options').innerText = s
	}

	return {
		init
	}

})()

window.addEventListener("DOMContentLoaded", function() {
	Demo.init()
})	

