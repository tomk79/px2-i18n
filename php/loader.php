<?php
namespace tomk79\pickles2\px2I18n;
class loader {

	/**
	 * $site オブジェクトを生成して登録する
	 *
	 * @param object $px Picklesオブジェクト
	 * @param object $options プラグイン設定
	 */
	public static function site( $px = null, $options = null ){

		if( count(func_get_args()) <= 1 ){
			return __CLASS__.'::'.__FUNCTION__.'('.( is_array($px) ? json_encode($px) : '' ).')';
		}

		$is_enable_sitemap = $px->is_path_enable_sitemap( $px->req()->get_request_file_path() );
		if( !$is_enable_sitemap ){
			return;
		}

		$site =  new site_multilang($px);
		$px->set_site( $site );
		return;
	}

	/**
	 * $lb オブジェクトを生成して登録する
	 *
	 * @param object $px Picklesオブジェクト
	 * @param object $options プラグイン設定
	 */
	public static function langbank( $px = null, $options = null ){

		if( count(func_get_args()) <= 1 ){
			return __CLASS__.'::'.__FUNCTION__.'('.( is_array($px) ? json_encode($px) : '' ).')';
		}

		$lb = new \tomk79\LangBank($options->path_csv);
		$lb->setLang( $px->lang() );
		$px->lb = $lb;

		return;
	}
}