<?php
namespace tomk79\pickles2\px2I18n\fields;
class html_attr_text extends \broccoliHtmlEditor\fieldBase{

    private $broccoli;

    /**
     * constructor
     */
    public function __construct($broccoli){
        $this->broccoli = $broccoli;
        parent::__construct($broccoli);
    }

	/**
	 * データをバインドする (Server Side)
	 */
	public function bind( $fieldData, $mode, $mod ){
		$rtn = '';
		$defaultLangSrc = '';
		$subLangsSrc = array();

		if(!isset($mod->subLangs)){
			$mod->subLangs = array();
		}

		if( is_array($fieldData) ){
			if( isset($fieldData['src']) && is_string($fieldData['src']) ){
				$defaultLangSrc = ''.$fieldData['src'];
				$defaultLangSrc = htmlspecialchars( $defaultLangSrc ); // ←HTML特殊文字変換
				// $defaultLangSrc = preg_replace('/\r\n|\r|\n/s', '<br />', $defaultLangSrc); // ← 改行コードは改行タグに変換
			}

			if( isset($fieldData['langs']) && is_array($fieldData['langs']) ){
				foreach( $mod->subLangs as $currentLang ){
					$currentLangSrc = '';
					if( isset($fieldData['langs'][$currentLang]['src']) ){
						$currentLangSrc = $fieldData['langs'][$currentLang]['src'];
					}
					$subLangsSrc[$currentLang] = ''.$currentLangSrc;
					$subLangsSrc[$currentLang] = htmlspecialchars( $subLangsSrc[$currentLang] ); // ←HTML特殊文字変換
					// $subLangsSrc[$currentLang] = preg_replace('/\r\n|\r|\n/s', '<br />', $subLangsSrc[$currentLang]); // ← 改行コードは改行タグに変換

				}
			}

		}

		foreach( $subLangsSrc as $lang=>$langSrc ){
			if( strlen($rtn) ){
				$rtn .= '<?php }else';
			}else{
				$rtn .= '<?php ';
			}
			$rtn .= 'if( $px->lang() == '.var_export($lang, true).' && '.var_export(strlen($langSrc), true).' ){ ?>';
			$rtn .= $langSrc;
		}
		if( strlen($rtn) ){
			$rtn .= '<?php }else{ ?>';
			$rtn .= $defaultLangSrc;
			$rtn .= '<?php }?>';
		}else{
			$rtn = $defaultLangSrc;
		}

		if( $mode == 'canvas' ){
			if( !strlen(trim($defaultLangSrc)) ){
				$rtn = '(ダブルクリックしてテキストを編集してください)';
			}else{
				$rtn = $defaultLangSrc;
			}
		}
		return $rtn;
	}



	/**
	 * GPI (Server Side)
	 */
	public function gpi($options = array()){

		switch($options['api']){
			case 'translate':
				$helper = new \tomk79\pickles2\px2I18n\field_helper();
				return $helper->machine_translation($options);
				break;

			default:
				return array(
					'status' => false,
					'message' => 'ERROR: Unknown API',
				);
				break;
		}

		return false;
	}


}