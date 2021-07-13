window.BroccoliFieldMultilangMultitext = function(broccoli){
	var $ = require('jquery');
	var isGlobalJQuery = ( window.jQuery ? true : false );

	function htmlspecialchars(text){
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
	 * プレビュー用の簡易なHTMLを生成する (Client Side)
	 * InstanceTreeViewで利用する。
	 */
	this.mkPreviewHtml = function( fieldData, mod, callback ){
		var rtn = '';
		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				if( fieldData && typeof(fieldData.src) == typeof('') ){
					rtn += fieldData.src;
				}
				rlv();

			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				callback( rtn );
			}); })
		;
		return this;
	}

	/**
	 * エディタUIを生成 (Client Side)
	 */
	this.mkEditor = function( mod, data, elm, callback ){
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
			var $div = $('<div>');
			$(elm).html($div);

			var fieldName = mod.name;

			if( lang ){
				fieldName += '--'+lang;
				$div.append($('<p>').text(lang).css({'font-weight':'bold'}));
			}



			var $rtn = $('<div>'),
				$formElm
			;

			if( rows == 1 ){
				$formElm = $('<input type="text" class="form-control">')
					.attr({
						"name": mod.name
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
				mod.aceEditor = ace.edit( $formElm.get(0) );
				// Ace Snippets - https://ace.c9.io/build/kitchen-sink.html
				mod.aceEditor.setFontSize(16);
				mod.aceEditor.getSession().setUseWrapMode(true);// Ace 自然改行
				mod.aceEditor.setShowInvisibles(true);// Ace 不可視文字の可視化
				mod.aceEditor.$blockScrolling = Infinity;
				mod.aceEditor.setTheme("ace/theme/github");
				mod.aceEditor.getSession().setMode("ace/mode/html");

				if( data.editor == 'text' ){
					mod.aceEditor.setTheme("ace/theme/katzenmilch");
					mod.aceEditor.getSession().setMode("ace/mode/plain_text");
				}else if( data.editor == 'markdown' ){
					mod.aceEditor.setTheme("ace/theme/github");
					mod.aceEditor.getSession().setMode("ace/mode/markdown");
				}else{
					mod.aceEditor.setTheme("ace/theme/monokai");
					mod.aceEditor.getSession().setMode("ace/mode/html");
				}

				// 編集中のコンテンツ量に合わせて、
				// AceEditor編集欄のサイズを広げる
				var updateAceHeight = function() {
					var h =
						mod.aceEditor.getSession().getScreenLength()
						* mod.aceEditor.renderer.lineHeight
						+ mod.aceEditor.renderer.scrollBar.getWidth()
					;
					if( h < mod.aceEditor.renderer.lineHeight * rows ){
						h = mod.aceEditor.renderer.lineHeight * rows;
					}
					$formElm.eq(0).height(h.toString() + "px");
					mod.aceEditor.resize();
				};
				mod.aceEditor.getSession().on('change', updateAceHeight);
				setTimeout(updateAceHeight, 200);

			}else{
				$formElm = $('<textarea class="form-control">')
					.attr({
						"name": mod.name,
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
						.append($('<span style="margin-right: 10px;"><label><input type="radio" name="editor-'+php.htmlspecialchars(mod.name)+'" value="" /> HTML</label></span>'))
						.append($('<span style="margin-right: 10px;"><label><input type="radio" name="editor-'+php.htmlspecialchars(mod.name)+'" value="text" /> テキスト</label></span>'))
						.append($('<span style="margin-right: 10px;"><label><input type="radio" name="editor-'+php.htmlspecialchars(mod.name)+'" value="markdown" /> Markdown</label></span>'))
					)
				;
				$rtn.find('input[type=radio][name=editor-'+mod.name+'][value="'+data.editor+'"]').attr({'checked':'checked'});

				if( editorLib == 'ace' && mod.aceEditor ){
					$rtn.find('input[type=radio][name=editor-'+mod.name+']').on('change', function(){
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
					});
				}
			}
		}

		// デフォルト言語
		var $elm = $('<div>');
		$elm.attr({
			'data-lang': 'editor-default-lang',
		});
		$(elm).append($elm);
		mkInputField($elm, data.src);

		// 副言語
		if( mod.subLangs && mod.subLangs.length ){

			var $selectLang = $('<select>');
			$(elm).append($selectLang);
			$selectLang.append('<option value="">select language...</option>');

			var $divSubLangs = $('<div class="broccoli-field-multilang-text-sublangs">');
			$(elm).append($divSubLangs);

			for(var idx = 0; idx < mod.subLangs.length; idx ++ ){
				$selectLang.append($('<option>')
					.attr({
						"value": mod.subLangs[idx],
					})
					.text( mod.subLangs[idx] )
				);
				var $elm = $('<div>');
				$elm.attr({
					'data-lang': 'editor-lang-'+mod.subLangs[idx],
				});
				$divSubLangs.append($elm);
				mkInputField($elm, data.langs[mod.subLangs[idx]], mod.subLangs[idx]);
			}

			$selectLang.append('<option value="_all">all</option>');
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

	// /**
	//  * エディタUIで編集した内容を検証する (Client Side)
	//  */
	// this.validateEditorContent = function( elm, mod, callback ){
	// 	var errorMsgs = [];
	// 	// errorMsgs.push('エラーがあります。');
	// 	new Promise(function(rlv){rlv();}).then(function(){ return new Promise(function(rlv, rjt){
	// 		callback( errorMsgs );
	// 	}); });
	// 	return this;
	// }

	/**
	 * エディタUIで編集した内容を保存 (Client Side)
	 */
	this.saveEditorContent = function( elm, data, mod, callback, options ){
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

		if( rows == 1 && $elm.find('[data-lang=editor-default-lang] input[type=text]').length ){
			// デフォルト言語
			rtn.src = $elm.find('[data-lang=editor-default-lang] input[type=text]').eq(0).val();
			rtn.editor = $elm.find('[data-lang=editor-default-lang] input[type=radio][name=editor-'+mod.name+']:checked').eq(0).val();

		}else if( isGlobalJQuery ){
			// jQuery がある場合

			// デフォルト言語
			var $targetElm = window.jQuery(elm).find('[data-lang=editor-default-lang] .broccoli-field-summernote').eq(0);
				// TODO: 隠蔽したい。

			rtn.src = $targetElm.summernote('code');

		}else{
			// jQuery がない場合

			// デフォルト言語
			rtn.src = $elm.find('[data-lang=editor-default-lang] .broccoli-field-summernote textarea').eq(0).val();
		}


		// 副言語
		if( mod.subLangs && mod.subLangs.length ){
			for(var idx = 0; idx < mod.subLangs.length; idx ++ ){
				var currentLang = mod.subLangs[idx];

				if( rows == 1 && $elm.find('[data-lang=editor-lang-'+currentLang+'] input[type=text]').length ){
					// 副言語
					rtn.langs[currentLang] = $elm.find('[data-lang=editor-lang-'+currentLang+'] input[type=text]').eq(0).val();

				}else if( isGlobalJQuery ){
					// jQuery がある場合

					// 副言語
					var $targetElm = window.jQuery(elm).find('[data-lang=editor-lang-'+currentLang+'] .broccoli-field-summernote').eq(0);
						// TODO: 隠蔽したい。

					rtn.langs[currentLang] = $targetElm.summernote('code');

				}else{
					// jQuery がない場合

					// 副言語
					rtn.langs[currentLang] = $elm.find('[data-lang=editor-lang-'+currentLang+'] .broccoli-field-summernote textarea').eq(0).val();
				}
			}
		}



		rtn = JSON.parse( JSON.stringify(rtn) );

		new Promise(function(rlv){rlv();}).then(function(){ return new Promise(function(rlv, rjt){
			callback(rtn);
		}); });
		return this;
	}

}
