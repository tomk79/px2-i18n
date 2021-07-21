window.BroccoliFieldPx2I18nSummernote = function(broccoli){
	var $ = require('jquery');
	var isGlobalJQuery = ( window.jQuery ? true : false );
	var i18nFieldHelper = new (require('../../_shared/scripts/fieldHelper'))(broccoli, this, {
		'mkUiUnit': function($elm, lang, mod){
			// --------------------------------------
			// 言語個別の入力欄のUIを生成する

			var $formElm;
			var fieldName = mod.name;
			if( lang ){
				fieldName += '--'+lang;
			}

			var rows = 12;
			if( mod.rows ){
				rows = mod.rows;
			}

			if( rows == 1 ){
				$formElm = $('<input type="text" class="px2-input px2-input--block">')
					.attr({
						"name": fieldName
					})
				;
				$elm.append( $formElm );

			}else{
				var $summernote = $('<div>');
				$summernote.addClass('broccoli-field-multilang-summernote');
				$elm.append(
					$summernote
				);

				if( isGlobalJQuery ){
					// jQuery がある場合
					var $targetElm = window.jQuery($elm).find('.broccoli-field-multilang-summernote').eq(0);
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

				}else{
					// jQuery がない場合
					console.error('broccoli-field-multilang-summernoteフィールドで Summernote (WYSIWYG)を利用するには、グローバルスコープに jQuery がロードされている必要があります。');
					$elm.find('.broccoli-field-multilang-summernote').append( $('<textarea class="px2-input px2-input--block">')
						.attr({
							"name": fieldName,
							"rows": rows
						})
					);
				}

			}

			if( rows == 1 && !lang ){
				$elm
					.append( $('<p>')
						.append($('<span style="margin-right: 10px;"><label><input type="radio" name="editor-'+i18nFieldHelper.h(fieldName)+'" value="" /> '+i18nFieldHelper.h( i18nFieldHelper.lb().get('label:html') )+'</label></span>'))
						.append($('<span style="margin-right: 10px;"><label><input type="radio" name="editor-'+i18nFieldHelper.h(fieldName)+'" value="text" /> '+i18nFieldHelper.h( i18nFieldHelper.lb().get('label:text') )+'</label></span>'))
						.append($('<span style="margin-right: 10px;"><label><input type="radio" name="editor-'+i18nFieldHelper.h(fieldName)+'" value="markdown" /> '+i18nFieldHelper.h( i18nFieldHelper.lb().get('label:markdown') )+'</label></span>'))
					)
				;

			}

			return;
		},
		'val': function($elm, lang, mod){
			// --------------------------------------
			// 言語個別の入力欄から値を抽出する

			var rows = 12;
			if( mod.rows ){
				rows = mod.rows;
			}

			var src = '';
			if( rows == 1 && $elm.find('input[type=text]').length ){
				src = $elm.find('input[type=text]').val();

			}else if( isGlobalJQuery ){
				// jQuery がある場合
				// TODO: 隠蔽したい。
				var $targetElm = window.jQuery($elm).find('.broccoli-field-multilang-summernote').eq(0);
				src = $targetElm.summernote('code');

			}else{
				// jQuery がない場合
				src = $elm.find('textarea').val();
			}

			var rtn = {};
			rtn.src = src;
			if( rows == 1 && !lang ){
				rtn.editor = $elm.find('input[type=radio][name=editor-'+mod.name+']:checked').val();
			}else{
				rtn.editor = '';
			}

			return rtn;
		},
		'updateVal': function($elm, lang, mod, val){
			// --------------------------------------
			// 言語個別の入力欄に値をセットする

			var rows = 12;
			if( mod.rows ){
				rows = mod.rows;
			}

			if( rows == 1 && $elm.find('input[type=text]').length ){
				$elm.find('input[type=text]').val( val.src );
			}else if( isGlobalJQuery ){
				// jQuery がある場合
				// TODO: 隠蔽したい。
				var $targetElm = window.jQuery($elm).find('.broccoli-field-multilang-summernote').eq(0);
				$targetElm.summernote('code', val.src);
			}else{
				// jQuery がない場合
				$elm.find('textarea').val( val.src );
			}

			if( rows == 1 && !lang ){
				$elm.find('input[type=radio][name=editor-'+mod.name+']').val( [val.editor] );
			}

			return true;
		},
	});

	/**
	 * データを正規化する (Client Side)
	 * このメソッドは、同期的に振る舞います。
	 */
	this.normalizeData = function( fieldData, mode ){
		return i18nFieldHelper.normalizeData( fieldData, mode );
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
					data.src = i18nFieldHelper.h(data.src);

					// 改行コードは改行タグに変換
					data.src = data.src.split(/\r\n|\r|\n/g).join('<br />');
					break;
			}
		}

		i18nFieldHelper.mkEditor( mod, data, elm, callback );
		return;
	}

	/**
	 * エディタUIで編集した内容を保存 (Client Side)
	 */
	this.saveEditorContent = function( elm, data, mod, callback, options ){
		i18nFieldHelper.saveEditorContent( elm, data, mod, callback, options );
		return;
	}

}
