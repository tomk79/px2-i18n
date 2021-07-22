<?php

/**
 * test
 */
class mainTest extends PHPUnit_Framework_TestCase{

	public function setup(){
		mb_internal_encoding('UTF-8');
	}



	/**
	 * プラグインメソッドを `config.php` から直接的な呼び出し方で設定するテスト
	 */
	public function testGettingPluginsName(){
		$this->assertEquals( \tomk79\pickles2\px2I18n\loader::site(), 'tomk79\pickles2\px2I18n\loader::site()' );

		// オプションを設定するテスト
		$options = array(
			'test' => 1,
		);
		$this->assertEquals( \tomk79\pickles2\px2I18n\loader::site( $options ), 'tomk79\pickles2\px2I18n\loader::site('.json_encode($options).')' );

	} // testGettingPluginsName()


}
