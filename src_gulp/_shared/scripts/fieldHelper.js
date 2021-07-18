module.exports = function( initOptions ){
	initOptions = initOptions || {};

	var _this = this;
	var $ = require('jquery');
	var editorLib = null;
	try {
		if(window.ace){
			editorLib = 'ace';
		}
	} catch (e) {
	}
	var templates = {
		'frame': require('..//templates/frame.twig'),
	};



	/**
	 * htmlspecialchars
	 */
	this.h = function(text){
		text = text.split(/\&/g).join('&amp;');
		text = text.split(/\</g).join('&lt;');
		text = text.split(/\>/g).join('&gt;');
		text = text.split(/\"/g).join('&quot;');
		return text;
	}

	/**
	 * データを正規化する (Client Side)
	 * このメソッドは、同期的に振る舞います。
	 */
	this.normalizeData = function( fieldData, mode ){
		// 編集画面用にデータを初期化。
		var rtn = {};
		if( typeof(fieldData) === typeof({}) ){
			rtn = fieldData;
		}else if( typeof(fieldData) === typeof('') ){
			rtn.src = fieldData;
			rtn.editor = 'markdown';
		}
		if(!rtn || typeof(rtn) != typeof({})){
			data = {
				src: '',
				editor: ''
			};
		}
		if(typeof(rtn.src) != typeof('')){
			rtn.src = '';
		}
		if(typeof(rtn.editor) != typeof('')){
			rtn.editor = '';
		}
		if(typeof(rtn.langs) != typeof({})){
			rtn.langs = {};
		}
		return rtn;
	}

	/**
	 * エディタUIを生成 (Client Side)
	 */
	this.mkEditor = function( mod, data, elm, callback ){
		var $elm = $(elm);

		if(!data || typeof(data) != typeof({})){
			data = {
				'src':'' + ( typeof(data) === typeof('') ? data : '' ),
				'editor':'markdown',
				'langs': {},
			};
		}

		var rows = 12;
		if( mod.rows ){
			rows = mod.rows;
		}

		if(typeof(data.src) != typeof('')){
			data.src = '';
		}
		if(typeof(data.editor) != typeof('')){
			data.editor = '';
		}
		if(typeof(data.langs) != typeof({})){
			data.langs = {};
		}

		function mkInputField(elm, src, lang){
			var $rtn = $(elm),
				$formElm
			;

			var fieldName = mod.name;

			if( lang ){
				fieldName += '--'+lang;
				$rtn.append($('<p>').text(lang).css({'font-weight':'bold'}));
			}

			if( rows == 1 ){
				$formElm = $('<input type="text" class="form-control">')
					.attr({
						"name": fieldName
					})
					.val(src)
					.css({'width':'100%'})
				;
				$rtn.append( $formElm );

			}else if( editorLib == 'ace' ){
				$formElm = $('<div>')
					.text(src)
					.css({
						'position': 'relative',
						'width': '100%',
						'height': 16 * rows,
						'border': '1px solid #ccc',
						'box-shadow': 'inset 0px 1px 1px rgba(0,0,0,0.075)',
						'border-radius': '4px',
						'overflow': 'hidden'
					})
				;
				$rtn.append( $formElm );
				var aceEditor = ace.edit( $formElm.get(0) );
				// Ace Snippets - https://ace.c9.io/build/kitchen-sink.html
				aceEditor.setFontSize(16);
				aceEditor.getSession().setUseWrapMode(true);// Ace 自然改行
				aceEditor.setShowInvisibles(true);// Ace 不可視文字の可視化
				aceEditor.$blockScrolling = Infinity;
				aceEditor.setTheme("ace/theme/github");
				aceEditor.getSession().setMode("ace/mode/html");

				if( data.editor == 'text' ){
					aceEditor.setTheme("ace/theme/katzenmilch");
					aceEditor.getSession().setMode("ace/mode/plain_text");
				}else if( data.editor == 'markdown' ){
					aceEditor.setTheme("ace/theme/github");
					aceEditor.getSession().setMode("ace/mode/markdown");
				}else{
					aceEditor.setTheme("ace/theme/monokai");
					aceEditor.getSession().setMode("ace/mode/html");
				}

				// 編集中のコンテンツ量に合わせて、
				// AceEditor編集欄のサイズを広げる
				var updateAceHeight = function() {
					var h =
						aceEditor.getSession().getScreenLength()
						* aceEditor.renderer.lineHeight
						+ aceEditor.renderer.scrollBar.getWidth()
					;
					if( h < aceEditor.renderer.lineHeight * rows ){
						h = aceEditor.renderer.lineHeight * rows;
					}
					$formElm.eq(0).height(h.toString() + "px");
					aceEditor.resize();
				};
				aceEditor.getSession().on('change', updateAceHeight);
				setTimeout(updateAceHeight, 200);

				if( lang ){
					mod.aceEditorLangs = mod.aceEditorLangs || {};
					mod.aceEditorLangs[lang] = aceEditor;
				}else{
					mod.aceEditor = aceEditor;
				}

			}else{
				$formElm = $('<textarea class="form-control">')
					.attr({
						"name": fieldName,
						"rows": rows
					})
					.css({
						'width':'100%',
						'height':'auto'
					})
					.val(src)
				;
				$rtn.append( $formElm );

			}

			if( !lang ){
				$rtn
					.append( $('<p>')
						.append($('<span style="margin-right: 10px;"><label><input type="radio" name="editor-'+i18nFieldHelper.h(fieldName)+'" value="" /> HTML</label></span>'))
						.append($('<span style="margin-right: 10px;"><label><input type="radio" name="editor-'+i18nFieldHelper.h(fieldName)+'" value="text" /> テキスト</label></span>'))
						.append($('<span style="margin-right: 10px;"><label><input type="radio" name="editor-'+i18nFieldHelper.h(fieldName)+'" value="markdown" /> Markdown</label></span>'))
					)
				;
				$rtn.find('input[type=radio][name=editor-'+fieldName+'][value="'+data.editor+'"]').attr({'checked':'checked'});

				if( editorLib == 'ace' && mod.aceEditor ){
					$rtn.find('input[type=radio][name=editor-'+fieldName+']').on('change', function(){
						var $this = $(this);
						var val = $this.val();
						if( val == 'text' ){
							mod.aceEditor.setTheme("ace/theme/katzenmilch");
							mod.aceEditor.getSession().setMode("ace/mode/plain_text");
						}else if( val == 'markdown' ){
							mod.aceEditor.setTheme("ace/theme/github");
							mod.aceEditor.getSession().setMode("ace/mode/markdown");
						}else{
							mod.aceEditor.setTheme("ace/theme/monokai");
							mod.aceEditor.getSession().setMode("ace/mode/html");
						}
						if( mod.aceEditorLangs && Object.keys(mod.aceEditorLangs).length ){
							for( var lang in mod.aceEditorLangs ){
								if( val == 'text' ){
									mod.aceEditorLangs[lang].setTheme("ace/theme/katzenmilch");
									mod.aceEditorLangs[lang].getSession().setMode("ace/mode/plain_text");
								}else if( val == 'markdown' ){
									mod.aceEditorLangs[lang].setTheme("ace/theme/github");
									mod.aceEditorLangs[lang].getSession().setMode("ace/mode/markdown");
								}else{
									mod.aceEditorLangs[lang].setTheme("ace/theme/monokai");
									mod.aceEditorLangs[lang].getSession().setMode("ace/mode/html");
								}
							}

						}
					});
				}
			}

			if( lang ){
				$rtn
					.find('button[data-btn=auto-translate]')
					.on('click', function(){
						var src = '';
						if( $elm.find('[data-lang=editor-default-lang] input[type=text]').length ){
							src = $elm.find('[data-lang=editor-default-lang] input[type=text]').val();
						}else if( editorLib == 'ace' && mod.aceEditor ){
							src = mod.aceEditor.getValue();
						}else{
							src = $elm.find('[data-lang=editor-default-lang] textarea').val();
						}
						src = JSON.parse( JSON.stringify(src) );
						var editor = $elm.find('[data-lang=editor-default-lang] input[type=radio][name=editor-'+mod.name+']:checked').val();
						// console.log('=-=-=-=-=', editor, src, mod);

						_this.callGpi(
							{
								'api': 'translate',
								'input': src,
								'source': (mod.defaultLang ? mod.defaultLang : 'ja'),
								'target': lang,
								'format': (editor=='text' || editor=='markdown' ? 'text' : 'html'),
								'autoTranslator': mod.autoTranslator,
							} ,
							function(output){
								console.log('=-=-=-=-=', output);
								return;
							}
						);
					})
				;


			}

		}

		// デフォルト言語
		$elm.append( templates.frame({
			"mod": mod,
			"data": data,
		}) );
		mkInputField($elm.find('[data-lang=editor-default-lang]'), data.src);

		// 副言語
		if( mod.subLangs && mod.subLangs.length ){

			var $selectLang = $elm.find('.broccoli-field-px2-i18n__sub-lang-selector select');
			var $divSubLangs = $elm.find('.broccoli-field-px2-i18n__sub-langs');

			for(var idx = 0; idx < mod.subLangs.length; idx ++ ){
				mkInputField(
					$elm.find('[data-lang=editor-lang-'+mod.subLangs[idx]+']'),
					data.langs[mod.subLangs[idx]].src,
					mod.subLangs[idx]
				);
			}

			$selectLang.on('change', function(){
				var $this = $(this);
				var selectedValue = $this.val();
				if( selectedValue == '_all' ){
					$divSubLangs.find( '[data-lang]' ).show();
					return;
				}
				$divSubLangs.find( '[data-lang]' ).hide();
				if( selectedValue == '' ){
					return;
				}
				$divSubLangs.find( '[data-lang=editor-lang-'+selectedValue+']' ).show();

			});
			$divSubLangs.find( '[data-lang]' ).hide();
		}


		new Promise(function(rlv){rlv();}).then(function(){ return new Promise(function(rlv, rjt){
			callback();
		}); });
		return this;
	}

	/**
	 * エディタUIで編集した内容を保存 (Client Side)
	 */
	this.saveEditorContent = function( elm, data, mod, callback, options ){
		// console.log($dom.html());
		if(typeof(data) !== typeof({})){
			data = {};
		}

		options = options || {};
		options.message = options.message || function(msg){};//ユーザーへのメッセージテキストを送信
		var rtn = {};
		var $elm = $(elm);

		var rows = 12;
		if( mod.rows ){
			rows = mod.rows;
		}

		rtn.src = '';
		rtn.editor = '';
		if(data.langs && typeof(data.langs) != typeof({})){
			rtn.langs = data.langs;
		}
		if(typeof(rtn.langs) != typeof({})){
			rtn.langs = {};
		}

		if( $elm.find('[data-lang=editor-default-lang] input[type=text]').length ){
			rtn.src = $elm.find('[data-lang=editor-default-lang] input[type=text]').val();
		}else if( editorLib == 'ace' && mod.aceEditor ){
			rtn.src = mod.aceEditor.getValue();
		}else{
			rtn.src = $elm.find('[data-lang=editor-default-lang] textarea').val();
		}
		rtn.src = JSON.parse( JSON.stringify(rtn.src) );
		rtn.editor = $elm.find('[data-lang=editor-default-lang] input[type=radio][name=editor-'+mod.name+']:checked').val();


		// 副言語
		if( mod.subLangs && mod.subLangs.length ){
			for(var idx = 0; idx < mod.subLangs.length; idx ++ ){
				var currentLang = mod.subLangs[idx];

				rtn.langs[currentLang] = rtn.langs[currentLang] || {
					'src': '',
				};
				if( $elm.find('[data-lang=editor-lang-'+currentLang+'] input[type=text]').length ){
					rtn.langs[currentLang].src = $elm.find('[data-lang=editor-lang-'+currentLang+'] input[type=text]').val();
				}else if( editorLib == 'ace' && mod.aceEditor ){
					mod.aceEditorLangs = mod.aceEditorLangs || {};
					rtn.langs[currentLang].src = mod.aceEditorLangs[currentLang].getValue();
				}else{
					rtn.langs[currentLang].src = $elm.find('[data-lang=editor-lang-'+currentLang+'] textarea').val();
				}
			}
		}



		rtn = JSON.parse( JSON.stringify(rtn) );

		new Promise(function(rlv){rlv();}).then(function(){ return new Promise(function(rlv, rjt){
			callback(rtn);
		}); });
		return;
	}

};