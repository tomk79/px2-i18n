<?php
namespace tomk79\pickles2\px2I18n;
class loader {

	/**
	 * $site オブジェクトを生成して登録する
	 */
	public static function site($px, $json){
		$is_enable_sitemap = $px->is_path_enable_sitemap( $px->req()->get_request_file_path() );
		if( !$is_enable_sitemap ){
			return;
		}

		$site =  new site_multilang($px);
		$px->set_site( $site );
		return;
	}

}