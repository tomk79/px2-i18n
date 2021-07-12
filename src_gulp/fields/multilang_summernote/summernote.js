window.BroccoliFieldMultilangSummernote = function(broccoli){
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
		var rtn = fieldData;
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
				src: '',
				editor: '',
				langs: {},
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

		if( rows != 1 ){

			switch( data.editor ){
				case 'markdown':
					var marked = require('marked');
					marked.setOptions({
						renderer: new marked.Renderer(),
						gfm: true,
						headerIds: false,
						tables: true,
						breaks: false,
						pedantic: false,
						sanitize: false,
						smartLists: true,
						smartypants: false,
						xhtml: true
					});
					data.src = marked(data.src);
					break;
				case 'text':
					// HTML特殊文字変換
					data.src = htmlspecialchars(data.src);

					// 改行コードは改行タグに変換
					data.src = data.src.split(/\r\n|\r|\n/g).join('<br />');
					break;
			}
		}


		function mkInputField(elm, src, lang){
			var $div = $('<div>');
			$(elm).html($div);

			var fieldName = mod.name;

			if( lang ){
				fieldName += '--'+lang;
				$div.append($('<p>').text(lang).css({'font-weight':'bold'}));
			}


			if( rows == 1 ){
				var $formElm = $('<input type="text" class="form-control">')
					.attr({
						"name": fieldName
					})
					.val(src)
					.css({'width':'100%'})
				;
				$div.append( $formElm );

				if( !lang ){
					$div
						.append( $('<p>')
							.append($('<span style="margin-right: 10px;"><label><input type="radio" name="editor-'+htmlspecialchars(fieldName)+'" value="" /> HTML</label></span>'))
							.append($('<span style="margin-right: 10px;"><label><input type="radio" name="editor-'+htmlspecialchars(fieldName)+'" value="text" /> テキスト</label></span>'))
							.append($('<span style="margin-right: 10px;"><label><input type="radio" name="editor-'+htmlspecialchars(fieldName)+'" value="markdown" /> Markdown</label></span>'))
						)
					;
					$div.find('input[type=radio][name=editor-'+fieldName+'][value="'+data.editor+'"]').attr({'checked':'checked'});
				}

			}else{

				var $summernote = $('<div>');
				$summernote.addClass('broccoli-field-summernote');
				$div.append(
					$summernote
				);

				if( isGlobalJQuery ){
					// jQuery がある場合
					var $targetElm = window.jQuery(elm).find('.broccoli-field-summernote').eq(0);
					$targetElm.summernote({
						// TODO: 隠蔽したい。
						placeholder: '',
						tabsize: 2,
						height: 90 + (18 * rows),
						toolbar: [
							['style', ['style']],
							['font', ['bold', 'underline', 'clear']],
							['color', ['color']],
							['para', ['ul', 'ol', 'paragraph']],
							['table', ['table']],
							['insert', ['link', 'picture', 'video']],
							['view', ['fullscreen', 'codeview', 'help']]
						]
					});
					$targetElm.summernote('code', src);
				}else{
					// jQuery がない場合
					console.error('broccoli-field-summernoteフィールドで Summernote (WYSIWYG)を利用するには、グローバルスコープに jQuery がロードされている必要があります。');
					$(elm).find('.broccoli-field-summernote').append( $('<textarea class="form-control">')
						.val(src)
						.attr({
							"rows": rows
						})
					);
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
