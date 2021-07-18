module.exports = function( field, initOptions ){
	initOptions = initOptions || {};
	initOptions.mkUiUnit = initOptions.mkUiUnit || function($elm, lang, mod){
		return;
	};
	initOptions.val = initOptions.val || function(){return;};
	initOptions.updateVal = initOptions.updateVal || function(){return;};

	var _this = this;
	var $ = require('jquery');
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
			data = this.normalizeData(data);
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


		// --------------------------------------
		// デフォルト言語
		$elm.append( templates.frame({
			"mod": mod,
			"data": data,
		}) );
		initOptions.mkUiUnit($elm.find('[data-lang=editor-default-lang]'), null, mod);
		initOptions.updateVal($elm.find('[data-lang=editor-default-lang]'), null, mod, {
			'src': data.src,
			'editor': data.editor,
		});


		// --------------------------------------
		// 副言語
		if( mod.subLangs && mod.subLangs.length ){

			var $selectLang = $elm.find('.broccoli-field-px2-i18n__sub-lang-selector select');
			var $divSubLangs = $elm.find('.broccoli-field-px2-i18n__sub-langs');

			for(var idx = 0; idx < mod.subLangs.length; idx ++ ){
				var $elmCurrentLang = $elm.find('[data-lang=editor-lang-'+mod.subLangs[idx]+']');
				initOptions.mkUiUnit(
					$elmCurrentLang,
					mod.subLangs[idx],
					mod
				);
				initOptions.updateVal(
					$elmCurrentLang,
					mod.subLangs[idx],
					mod,
					{
						'src': data.langs[mod.subLangs[idx]].src,
					}
				);

				$elmCurrentLang
					.find('button[data-btn=auto-translate]')
					.attr({'data-lang': mod.subLangs[idx]})
					.on('click', function(){
						var defaultLangValue = initOptions.val(
							$elm.find('[data-lang=editor-default-lang]'),
							null,
							mod
						);
						var src = defaultLangValue.src;
						var editor = defaultLangValue.editor;
						// console.log('=-=-=-=-=', editor, src, mod);

						var currentLang = $(this).attr('data-lang');

						field.callGpi(
							{
								'api': 'translate',
								'input': src,
								'source': (mod.defaultLang ? mod.defaultLang : 'ja'),
								'target': currentLang,
								'format': (editor=='text' || editor=='markdown' ? 'text' : 'html'),
								'autoTranslator': mod.autoTranslator,
							} ,
							function(output){
								// console.log('=-=-=-=-=', output);
								if( !output.status ){
									alert( '[ERROR] ' + output.message );
									return;
								}

								initOptions.updateVal(
									$elmCurrentLang = $elm.find('[data-lang=editor-lang-'+currentLang+']'),
									currentLang,
									mod,
									{
										'src': output.result,
									}
								);

								return;
							}
						);
					})
				;

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
			setTimeout(function(){
				$divSubLangs.find( '[data-lang]' ).hide();
			}, 0);
		}


		new Promise(function(rlv){rlv();}).then(function(){ return new Promise(function(rlv, rjt){
			callback();
		}); });
		return;
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

		rtn.src = '';
		rtn.editor = '';
		if(data.langs && typeof(data.langs) != typeof({})){
			rtn.langs = data.langs;
		}
		if(typeof(rtn.langs) != typeof({})){
			rtn.langs = {};
		}

		var mainLangVal = initOptions.val(
			$elm.find('[data-lang=editor-default-lang]'),
			null,
			mod
		);
		rtn.src = mainLangVal.src;
		rtn.editor = mainLangVal.editor;


		// 副言語
		if( mod.subLangs && mod.subLangs.length ){
			for(var idx = 0; idx < mod.subLangs.length; idx ++ ){
				var currentLang = mod.subLangs[idx];

				var currentLangVal = initOptions.val(
					$elm.find('[data-lang=editor-lang-'+currentLang+']'),
					currentLang,
					mod
				);

				rtn.langs[currentLang] = rtn.langs[currentLang] || {
					'src': '',
				};
				rtn.langs[currentLang].src = currentLangVal.src;
			}
		}



		rtn = JSON.parse( JSON.stringify(rtn) );

		new Promise(function(rlv){rlv();}).then(function(){ return new Promise(function(rlv, rjt){
			callback(rtn);
		}); });
		return;
	}

};