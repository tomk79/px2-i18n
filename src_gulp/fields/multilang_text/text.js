window.BroccoliFieldMultilangText = function(broccoli){
	var $ = require('jquery');

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
				editor: 'text',
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
			data.editor = 'text';
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


			if( rows == 1 ){
				var $formElm = $('<input type="text" class="form-control">')
					.attr({
						"name": fieldName
					})
					.val(src)
					.css({'width':'100%'})
				;
				$div.append( $formElm );

			}else{

				var $text = $('<div>');
				$text.addClass('broccoli-field-text');
				$div.append(
					$text
				);

				$(elm).find('.broccoli-field-text').append( $('<textarea class="form-control">')
					.val(src)
					.attr({
						"rows": rows
					})
				);
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

		}else{
			// jQuery がない場合

			// デフォルト言語
			rtn.src = $elm.find('[data-lang=editor-default-lang] .broccoli-field-text textarea').eq(0).val();
		}


		// 副言語
		if( mod.subLangs && mod.subLangs.length ){
			for(var idx = 0; idx < mod.subLangs.length; idx ++ ){
				var currentLang = mod.subLangs[idx];

				if( rows == 1 && $elm.find('[data-lang=editor-lang-'+currentLang+'] input[type=text]').length ){
					// 副言語
					rtn.langs[currentLang] = $elm.find('[data-lang=editor-lang-'+currentLang+'] input[type=text]').eq(0).val();

				}else{
					// jQuery がない場合

					// 副言語
					rtn.langs[currentLang] = $elm.find('[data-lang=editor-lang-'+currentLang+'] .broccoli-field-text textarea').eq(0).val();
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
