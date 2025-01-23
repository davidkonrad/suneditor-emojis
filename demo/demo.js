"use strict";

const Tests = [
	{ 
		desc: 'Default initialization',
		options: undefined
	},
	{ 
		desc: 'No topmenu',
		options: {
			topmenu: false
		}
	},
	{ 
		desc: 'Smileys and flags only',
		options: {
			iconSize: '1.5rem',
			sections: ['Smileys & Emotion', 'Flags'],
			names: ['Emojis', 'Flags']
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

	const initEditor = function(opt) {
		const options = {
			mode: 'classic',
			width: '100%',
			height: 'auto',
			minHeight : '40vh',
			plugins: [emojisPlugin],
			buttonList: [
				['undo', 'redo', 'font', 'fontSize', 'formatBlock'], ['emojis'],
				['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'removeFormat'],
				['fontColor', 'hiliteColor'], 
			],
			lang: SUNEDITOR_LANG['en'],
			charCounter: true
		}
		if (opt) options.emojis = opt
		if (editor) editor.destroy()
		editor = SUNEDITOR.create('editor', options)
		document.querySelector('.sun-editor-editable').focus()
		let s = ''
		if (opt) {
			const obj = { emojis: opt }
			s = JSON.stringify(obj, null, 2)
			s = s.substr(1, s.length-2)
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

