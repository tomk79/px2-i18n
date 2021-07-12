<?php
namespace proj;
class site extends \picklesFramework2\site{

	private $px;

	/**
	 * $site オブジェクトを生成して登録する
	 */
	public static function initialize($px, $json){
		$is_enable_sitemap = $px->is_path_enable_sitemap( $px->req()->get_request_file_path() );
		if( !$is_enable_sitemap ){
			return;
		}

		$site =  new self($px);
		$px->set_site( $site );
		return;
	}

	/**
	 * Constructor
	 *
	 * @param object $px Picklesオブジェクト
	 */
	public function __construct( $px ){
		$this->px = $px;
		parent::__construct( $px );
	}

	/**
	 * ページ情報を取得する。
	 *
	 * 元の `$site` を継承し、言語別のセル値を検索して返す機能を追加します。
	 *
	 * @param string $path 取得するページのパス または ページID。
	 * @param string $key 取り出す単一要素のキー。省略時はすべての要素を含む連想配列が返されます。省略可。
	 * @return mixed 単一ページ情報を格納する連想配列、`$key` が指定された場合は、その値のみ。
	 */
	public function get_page_info( $path, $key = null ){
		$args = func_get_args();
		$page_info = call_user_func_array( array('parent', 'get_page_info'), $args );

		if( is_null($page_info) ){
			// ページが見つからない場合
			return $page_info;
		}

		if( count($args) <= 1 && is_array($page_info) ){
			// $key の指定なしで引いた場合
			foreach( $page_info as $key=>$val ){
				$lang_key = $key.'('.$this->px->lang().')';
				if( array_key_exists($lang_key, $page_info) && strlen($page_info[$lang_key]) ){
					$page_info[$key] = $page_info[$lang_key];
					continue;
				}

				if( isset($page_info['title('.$this->px->lang().')']) && strlen($page_info['title('.$this->px->lang().')']) ){
					// title派生に関する特別な処理
					$title_lang = $page_info['title('.$this->px->lang().')'];
					if( strlen($title_lang) ){
						switch( $key ){
							case 'title_h1':
							case 'title_label':
							case 'title_breadcrumb':
								$page_info[$key] = $title_lang;
								break;
							case 'title_full':
								$page_info[$key] = $title_lang.' | '.$this->px->conf()->name;
								break;
						}
					}
				}
			}
			return $page_info;
		}

		if( count($args) >= 2 && is_string($page_info) ){
			// $key を指定して引いた場合
			$page_info_lang = parent::get_page_info( $path, $key.'('.$this->px->lang().')' );
			if( strlen($page_info_lang) ){
				return $page_info_lang;
			}

			// title派生に関する特別な処理
			$title_lang = parent::get_page_info( $path, 'title('.$this->px->lang().')' );
			if( strlen($title_lang) ){
				switch( $key ){
					case 'title_h1':
					case 'title_label':
					case 'title_breadcrumb':
						return $title_lang;
						break;
					case 'title_full':
						return $title_lang.' | '.$this->px->conf()->name;
						break;
				}
			}

			return $page_info;
		}

		return $page_info;
	}
}