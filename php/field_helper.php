<?php
namespace tomk79\pickles2\px2I18n;
class field_helper {

	/**
	 * 機械翻訳
	 */
	public function machine_translation( $options = array() ){
		$translate = new \Google\Cloud\Translate\V2\TranslateClient();

		$result = array(
			'text' => null,
		);
		try{
			$result = $translate->translate(
				$options['input'],
				array(
					'source' => $options['source'],
					'target' => $options['target'],
					'format' => $options['format'],
				)
			);
		}catch( \Exception $e ){
			return array(
				'status' => false,
				'message' => $e->getMessage(),
			);
		}

		return array(
			'status' => true,
			'message' => 'OK',
			'result' => $result['text'],
		);
	}

}