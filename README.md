# tomk79/px2-i18n

[Pickles 2](https://pickles2.pxt.jp/) で制作するウェブサイトを、多言語に対応させるプラグインです。


## 導入手順 - Setup

### 1. composer.json に tomk79/px2-i18n を追加

`require` の項目に、`tomk79/px2-i18n` を追加します。

```
$ composer require tomk79/px2-i18n;
```

### 2. config.php に、設定を追加

設定ファイル `config.php` (通常は `./px-files/config.php`) を編集します。


#### 対応する言語の設定

```php
/** デフォルトの言語 */
$conf->default_lang = 'ja';

/** 対応する言語 */
$conf->accept_langs = array('en', 'zh-CN', 'zh-TW', 'ko');
```

#### サイトマップの多言語化

`$conf->funcs->before_sitemap` の最後に `tomk79\pickles2\px2I18n\loader::site()` を追加します。

```php
/**
 * funcs: Before sitemap
 *
 * サイトマップ読み込みの前に実行するプラグインを設定します。
 */
$conf->funcs->before_sitemap = array(

    /* 中略 */

    // カスタムサイトマップオブジェクトを生成して登録する
    'tomk79\\pickles2\\px2I18n\\loader::site()',
);
```

#### Broccoliテキスト入力フィールドの多言語化

```php
/** カスタムフィールドを登録 */
$conf->plugins->px2dt->guieditor->custom_fields = array(
	'text'=>array(
		'backend'=>array(
			'class' => 'tomk79\\pickles2\\px2I18n\\fields\\text',
			'require' => 'path/to/vendor/tomk79/px2-i18n/fields/i18n_text/backend/text.js',
		),
		'frontend'=>array(
			'dir' => 'path/to/vendor/tomk79/px2-i18n/fields/i18n_text/frontend/',
			'file' => array(
				'text.css',
				'text.js'
			),
			'function' => 'window.BroccoliFieldPx2I18nText'
		),
	),
	'html_attr_text'=>array(
		'backend'=>array(
			'class' => 'tomk79\\pickles2\\px2I18n\\fields\\html_attr_text',
			'require' => 'path/to/vendor/tomk79/px2-i18n/fields/i18n_html_attr_text/backend/html_attr_text.js',
		),
		'frontend'=>array(
			'dir' => 'path/to/vendor/tomk79/px2-i18n/fields/i18n_html_attr_text/frontend/',
			'file' => array(
				'html_attr_text.css',
				'html_attr_text.js'
			),
			'function' => 'window.BroccoliFieldPx2I18nHtmlAttrText'
		),
	),
	'multitext'=>array(
		'backend'=>array(
			'class' => 'tomk79\\pickles2\\px2I18n\\fields\\multitext',
			'require' => 'path/to/vendor/tomk79/px2-i18n/fields/i18n_multitext/backend/multitext.js',
		),
		'frontend'=>array(
			'dir' => 'path/to/vendor/tomk79/px2-i18n/fields/i18n_multitext/frontend/',
			'file' => array(
				'multitext.css',
				'multitext.js',
			),
			'function' => 'window.BroccoliFieldPx2I18nMultitext'
		),
	),
	'summernote'=>array(
		'backend'=>array(
			'class' => 'tomk79\\pickles2\\px2I18n\\fields\\summernote',
			'require' => 'path/to/vendor/tomk79/px2-i18n/fields/i18n_summernote/backend/summernote.js',
		),
		'frontend'=>array(
			'dir' => 'path/to/vendor/tomk79/px2-i18n/fields/i18n_summernote/frontend/',
			'file' => array(
				'summernote.css',
				'summernote.js',
				"summernote/summernote.min.css",
				"summernote/summernote.min.js",
			),
			'function' => 'window.BroccoliFieldPx2I18nSummernote'
		),
	),
);

/** Broccoliフィールドの初期設定 */
$mlSettings = array(
	'defaultLang' => $conf->default_lang,
	'subLangs' => $conf->accept_langs,
);

$conf->plugins->px2dt->guieditor->field_config = array(

	// text フィールドを設定
	'text' => $mlSettings,

	// html_attr_text フィールドを設定
	'html_attr_text' => $mlSettings,

	// multitext フィールドを設定
	'multitext' => $mlSettings,

	// summernote フィールドを設定
	'summernote' => $mlSettings,
);
```


#### Google Translation の認証情報を環境変数に宣言

```php
// Google Cloud の認証情報のパスを、環境変数として宣言する
putenv( 'GOOGLE_APPLICATION_CREDENTIALS=/path/to/google-cloud-credentials.json' );
```



#### 多言語化されたページのパブリッシュ設定

各言語への対応を、デバイス別の出力設定として定義していきます。

```php
$devices = array();
foreach( $conf->accept_langs as $langCode ){
	array_push( $devices, array(
		'user_agent'=>'Mozilla/',$langCode,
		'params' => array(
			'LANG' => $langCode,
		),
		'path_publish_dir'=>'../dist/',
		'path_rewrite_rule'=>'/'.$langCode.'{$dirname}/{$filename}.{$ext}',
		'paths_target'=>array(
			'/*',
		),
		'paths_ignore'=>array(
			// '/common/*',
		),

		// リンクの書き換え方向
		// `origin2origin`、`origin2rewrited`、`rewrited2origin`、`rewrited2rewrited` のいずれかで指定します。
		// `origin` は変換前のパス、 `rewrited` は変換後のパスを意味します。
		// 変換前のパスから変換後のパスへのリンクとして書き換える場合は `origin2rewrited` のように指定します。
		'rewrite_direction'=>'rewrited2rewrited',
	) );
}

/**
 * funcs: Before content
 *
 * サイトマップ読み込みの後、コンテンツ実行の前に実行するプラグインを設定します。
 */
$conf->funcs->before_content = array(
    // PX=api
    'picklesFramework2\commands\api::register' ,

    // PX=publish (px2-publish-ex)
    'tomk79\pickles2\publishEx\publish::register('.json_encode(array(
        'devices'=>$devices,
    )).')' ,

    // PX=px2dthelper
    'tomk79\pickles2\px2dthelper\main::register' ,
);
```



## 更新履歴 - Change log

### tomk79/px2-i18n v0.0.1 (リリース日未定)

- 編集画面を多言語対応(英語、中文、韓国語)した。

### tomk79/px2-i18n v0.0.1 (2021年7月18日)

- 初版リリース。


## ライセンス - License

MIT License


## 作者 - Author

- Tomoya Koyanagi <tomk79@gmail.com>
- website: <https://www.pxt.jp/>
- Twitter: @tomk79 <https://twitter.com/tomk79/>
