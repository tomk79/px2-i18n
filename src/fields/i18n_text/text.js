window.BroccoliFieldPx2I18nText = function(broccoli){
	var $ = require('jquery');
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
				var $formElm = $('<input type="text" class="px2-input px2-input--block">')
					.attr({
						"name": fieldName
					})
					.css({'width':'100%'})
				;
				$elm.append( $formElm );

			}else{

				var $text = $('<div>');
				$elm.append(
					$text
				);

				$text.append( $('<textarea class="px2-input px2-input--block">')
					.attr({
						"rows": rows
					})
				);
			}

			return;
		},
		'val': function($elm, lang, mod){
			// --------------------------------------
			// 言語個別の入力欄から値を抽出する

			var src = '';
			if( $elm.find('input[type=text]').length ){
				src = $elm.find('input[type=text]').val();
			}else{
				src = $elm.find('textarea').val();
			}

			var rtn = {};
			rtn.src = src;
			if( !lang ){
				rtn.editor = 'text';
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

			if( $elm.find('input[type=text]').length ){
				$elm.find('input[type=text]').val( val.src );
			}else{
				$elm.find('textarea').val( val.src );
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
