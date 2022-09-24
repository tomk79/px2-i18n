module.exports = function( broccoli, field, initOptions ){
	initOptions = initOptions || {};
	initOptions.mkUiUnit = initOptions.mkUiUnit || function($elm, lang, mod){
		return;
	};
	initOptions.val = initOptions.val || function(){return;};
	initOptions.updateVal = initOptions.updateVal || function(){return;};

	const _this = this;
	const $ = require('jquery');
	const it79 = require('iterate79');
	require('px2style/px2style/px2style.js');
	const px2style = window.px2style;
	const templates = {
		'frame': require('..//templates/frame.twig'),
	};
	const LangBank = require('langbank');
	let lb;
	const langCsv = require('../languages/language.csv')();


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
	 * LangBank
	 */
	this.lb = function(){
		return lb;
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
		var $mainBlock;
		var langLabels = {};

		it79.fnc({}, [
			function(it1){
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

				it1.next();
			},
			function(it1){
				lb = new LangBank(langCsv, function(){
					lb.setLang( broccoli.options.lang );
					it1.next();
				});
			},
			function(it1){
				langLabels[mod.defaultLang] = lb.get( 'lang:'+mod.defaultLang );
				for( var idx in mod.subLangs ){
					var lang = mod.subLangs[idx];
					langLabels[lang] = lb.get( 'lang:'+lang );
					if( langLabels[lang] == '---' ){
						langLabels[lang] = lang;
					}
				}
				it1.next();
			},
			function(it1){

				// --------------------------------------
				// デフォルト言語
				$elm.append( templates.frame({
					"mod": mod,
					"data": data,
					"lb": lb,
					"langLabels": langLabels,
				}) );
				initOptions.mkUiUnit($elm.find('[data-lang=editor-default-lang]'), null, mod);
				initOptions.updateVal($elm.find('[data-lang=editor-default-lang]'), null, mod, {
					'src': data.src,
					'editor': data.editor,
				});


				$mainBlock = $elm.find('.broccoli-field-px2-i18n__main-block');


				// --------------------------------------
				// 副言語
				if( mod.subLangs && mod.subLangs.length ){

					var $selectLang = $elm.find('.broccoli-field-px2-i18n__sub-lang-selector select');
					var $divSubLangs = $elm.find('.broccoli-field-px2-i18n__sub-langs');

					for(var idx = 0; idx < mod.subLangs.length; idx ++ ){
						var $elmCurrentLang = $elm.find('[data-lang=editor-lang-'+mod.subLangs[idx]+']');
						var srcCurrentLang = '';
						if( data.langs[mod.subLangs[idx]] ){
							srcCurrentLang = data.langs[mod.subLangs[idx]].src;
						}
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
								'src': srcCurrentLang,
							}
						);

						$elmCurrentLang
							.parent()
							.find('button[data-btn=auto-translate]')
							.attr({'data-lang': mod.subLangs[idx]})
							.on('click', function(){
								var $this = $(this);
								px2style.loading();
								$this.attr({'disabled': 'disabled'});
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
									} ,
									function(output){
										// console.log('=-=-=-=-=', output);
										if( !output.status ){
											alert( '[ERROR] ' + output.message );
											px2style.closeLoading();
											$this.removeAttr('disabled');
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

										setTimeout(function(){
											$this.removeAttr('disabled');
											px2style.closeLoading();
										}, 500)
										return;
									}
								);
							})
						;

					}

					$elm.find('[data-btn="clear-all"]')
						.on('click', function(){
							// --------------------------------------
							// すべてリセット
							var $this = $(this);
							$this.attr({'disabled': 'disabled'});
							px2style.loading();
							it79.ary(
								mod.subLangs,
								2,
								function(it, row, idx){
									// console.log(idx, row);

									var value = initOptions.val(
										$elm.find('[data-lang=editor-lang-'+row+']'),
										row,
										mod
									);
									// console.log(idx, row, value);
									value.src = '';

									initOptions.updateVal(
										$elm.find('[data-lang=editor-lang-'+row+']'),
										row,
										mod,
										value
									);

									setTimeout(function(){
										it.next();
									}, 10);
								},
								function(){
									console.log('done!');
									px2style.closeLoading();
									$this.removeAttr('disabled');
								}
							);
						});
					$elm.find('[data-btn="auto-translate-all"]')
						.on('click', function(){
							// --------------------------------------
							// すべて自動翻訳
							var $this = $(this);
							$this.attr({'disabled': 'disabled'});
							px2style.loading();
							it79.ary(
								mod.subLangs,
								2,
								function(it, row, idx){
									// console.log(idx, row);

									var value = initOptions.val(
										$elm.find('[data-lang=editor-default-lang]'),
										null,
										mod
									);
									// console.log(idx, row, value);

									field.callGpi(
										{
											'api': 'translate',
											'input': value.src,
											'source': (mod.defaultLang ? mod.defaultLang : 'ja'),
											'target': row,
											'format': (value.editor=='text' || value.editor=='markdown' ? 'text' : 'html'),
										} ,
										function(output){
											// console.log('=-=-=-=-=', output);
											if( !output.status ){
												console.error( '[ERROR] ' + output.message );
												alert( '[ERROR] ' + output.message );
												it.next();
												return;
											}

											initOptions.updateVal(
												$elm.find('[data-lang=editor-lang-'+row+']'),
												row,
												mod,
												{
													'src': output.result,
												}
											);

											setTimeout(function(){
												it.next();
											}, 10);
											return;
										}
									);

								},
								function(){
									console.log('done!');
									px2style.closeLoading();
									$this.removeAttr('disabled');
								}
							);
						});


					$selectLang.on('change', function(){
						var $this = $(this);
						var selectedValue = $this.val();

						$elm.find('[data-btn="clear-all"]').hide();
						$elm.find('[data-btn="auto-translate-all"]').hide();

						if( selectedValue == '_all' ){
							$divSubLangs.find('.broccoli-field-px2-i18n__sub-langs-body').show();
							$mainBlock.removeClass('broccoli-field-px2-i18n--default-only');
							$elm.find('[data-btn="clear-all"]').show();
							$elm.find('[data-btn="auto-translate-all"]').show();
							return;
						}
						$divSubLangs.find( '.broccoli-field-px2-i18n__sub-langs-body' ).hide();
						if( selectedValue == '' ){
							$mainBlock.addClass('broccoli-field-px2-i18n--default-only');
							return;
						}
						$divSubLangs.find( '[data-lang=editor-lang-'+selectedValue+']' ).parent().show();
						$mainBlock.removeClass('broccoli-field-px2-i18n--default-only');

					});
					setTimeout(function(){
						$mainBlock.addClass('broccoli-field-px2-i18n--default-only');
						$divSubLangs.find( '.broccoli-field-px2-i18n__sub-langs-body' ).hide();
						$elm.find('[data-btn="clear-all"]').hide();
						$elm.find('[data-btn="auto-translate-all"]').hide();
					}, 0);
				}


				new Promise(function(rlv){rlv();}).then(function(){ return new Promise(function(rlv, rjt){
					it1.next();
				}); });
			},
			function(it1){
				callback();
			},
		]);
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