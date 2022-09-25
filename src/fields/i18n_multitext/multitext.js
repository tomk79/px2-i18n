window.BroccoliFieldPx2I18nMultitext = function(broccoli){
	var _this = this;
	var $ = require('jquery');
	var editorLib = null;
	try {
		if(window.ace){
			editorLib = 'ace';
		}
	} catch (e) {
	}
	var aceEditor;
	var aceEditorLangs = {};

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
					.css({'width':'100%'})
				;
				$elm.append( $formElm );

			}else if( editorLib == 'ace' ){
				$formElm = $('<div>')
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
				$elm.append( $formElm );
				var tmpAceEditor = ace.edit( $formElm.get(0) );
				// Ace Snippets - https://ace.c9.io/build/kitchen-sink.html
				tmpAceEditor.setFontSize(16);
				tmpAceEditor.getSession().setUseWrapMode(true);// Ace 自然改行
				tmpAceEditor.setShowInvisibles(true);// Ace 不可視文字の可視化
				tmpAceEditor.$blockScrolling = Infinity;
				tmpAceEditor.setTheme("ace/theme/github");
				tmpAceEditor.getSession().setMode("ace/mode/html");


				// 編集中のコンテンツ量に合わせて、
				// tmpAceEditor編集欄のサイズを広げる
				var updateAceHeight = function() {
					var h =
						tmpAceEditor.getSession().getScreenLength()
						* tmpAceEditor.renderer.lineHeight
						+ tmpAceEditor.renderer.scrollBar.getWidth()
					;
					if( h < tmpAceEditor.renderer.lineHeight * rows ){
						h = tmpAceEditor.renderer.lineHeight * rows;
					}
					$formElm.eq(0).height(h.toString() + "px");
					tmpAceEditor.resize();
				};

				tmpAceEditor.getSession().on('change', updateAceHeight);
				setTimeout(updateAceHeight, 200);

				if( lang ){
					aceEditorLangs = aceEditorLangs || {};
					aceEditorLangs[lang] = tmpAceEditor;
				}else{
					aceEditor = tmpAceEditor;
				}

			}else{
				$formElm = $('<textarea class="px2-input px2-input--block">')
					.attr({
						"name": fieldName,
						"rows": rows
					})
					.css({
						'width':'100%',
						'height':'auto'
					})
				;
				$elm.append( $formElm );

			}

			if( !lang ){
				$elm
					.append( $('<p>')
						.append($('<span style="margin-right: 10px;"><label><input type="radio" name="editor-'+i18nFieldHelper.h(fieldName)+'" value="" /> '+i18nFieldHelper.h( i18nFieldHelper.lb().get('label:html') )+'</label></span>'))
						.append($('<span style="margin-right: 10px;"><label><input type="radio" name="editor-'+i18nFieldHelper.h(fieldName)+'" value="text" /> '+i18nFieldHelper.h( i18nFieldHelper.lb().get('label:text') )+'</label></span>'))
						.append($('<span style="margin-right: 10px;"><label><input type="radio" name="editor-'+i18nFieldHelper.h(fieldName)+'" value="markdown" /> '+i18nFieldHelper.h( i18nFieldHelper.lb().get('label:markdown') )+'</label></span>'))
					)
				;

				if( editorLib == 'ace' && aceEditor ){
					$elm.find('input[type=radio][name=editor-'+fieldName+']').on('change', function(){
						var $this = $(this);
						var val = $this.val();

						if( val == 'text' ){
							aceEditor.setTheme("ace/theme/katzenmilch");
							aceEditor.getSession().setMode("ace/mode/plain_text");
						}else if( val == 'markdown' ){
							aceEditor.setTheme("ace/theme/github");
							aceEditor.getSession().setMode("ace/mode/markdown");
						}else{
							aceEditor.setTheme("ace/theme/monokai");
							aceEditor.getSession().setMode("ace/mode/html");
						}
						if( aceEditorLangs && Object.keys(aceEditorLangs).length ){
							for( var lang in aceEditorLangs ){
								if( val == 'text' ){
									aceEditorLangs[lang].setTheme("ace/theme/katzenmilch");
									aceEditorLangs[lang].getSession().setMode("ace/mode/plain_text");
								}else if( val == 'markdown' ){
									aceEditorLangs[lang].setTheme("ace/theme/github");
									aceEditorLangs[lang].getSession().setMode("ace/mode/markdown");
								}else{
									aceEditorLangs[lang].setTheme("ace/theme/monokai");
									aceEditorLangs[lang].getSession().setMode("ace/mode/html");
								}
							}

						}
					});
				}

			}

			return;
		},
		'val': function($elm, lang, mod){
			// --------------------------------------
			// 言語個別の入力欄から値を抽出する

			var tmpAceEditor;
			if( !lang ){
				tmpAceEditor = aceEditor;
			}else{
				tmpAceEditor = aceEditorLangs[lang];
			}

			var src = '';
			if( $elm.find('input[type=text]').length ){
				src = $elm.find('input[type=text]').val();
			}else if( editorLib == 'ace' && tmpAceEditor ){
				src = tmpAceEditor.getValue();
			}else{
				src = $elm.find('textarea').val();
			}

			var rtn = {};
			rtn.src = src;
			if( !lang ){
				rtn.editor = $elm.find('input[type=radio][name=editor-'+mod.name+']:checked').val();
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

			var tmpAceEditor;
			if( !lang ){
				tmpAceEditor = aceEditor;
			}else{
				tmpAceEditor = aceEditorLangs[lang];
			}

			if( $elm.find('input[type=text]').length ){
				$elm.find('input[type=text]').val( val.src );
			}else if( editorLib == 'ace' && tmpAceEditor ){
				tmpAceEditor.setValue( val.src );
				tmpAceEditor.clearSelection();
			}else{
				$elm.find('textarea').val( val.src );
			}

			if( !lang ){
				$elm.find('input[type=radio][name=editor-'+mod.name+']').val( [val.editor] );
			}



			if( !lang && editorLib == 'ace' && aceEditor ){

				if( val.editor == 'text' ){
					aceEditor.setTheme("ace/theme/katzenmilch");
					aceEditor.getSession().setMode("ace/mode/plain_text");
				}else if( val.editor == 'markdown' ){
					aceEditor.setTheme("ace/theme/github");
					aceEditor.getSession().setMode("ace/mode/markdown");
				}else{
					aceEditor.setTheme("ace/theme/monokai");
					aceEditor.getSession().setMode("ace/mode/html");
				}


				if( aceEditorLangs && Object.keys(aceEditorLangs).length ){
					for( var lang in aceEditorLangs ){
						if( val.editor == 'text' ){
							aceEditorLangs[lang].setTheme("ace/theme/katzenmilch");
							aceEditorLangs[lang].getSession().setMode("ace/mode/plain_text");
						}else if( val.editor == 'markdown' ){
							aceEditorLangs[lang].setTheme("ace/theme/github");
							aceEditorLangs[lang].getSession().setMode("ace/mode/markdown");
						}else{
							aceEditorLangs[lang].setTheme("ace/theme/monokai");
							aceEditorLangs[lang].getSession().setMode("ace/mode/html");
						}
					}

				}
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
		return;
	}

	/**
	 * エディタUIを生成 (Client Side)
	 */
	this.mkEditor = function( mod, data, elm, callback ){
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
