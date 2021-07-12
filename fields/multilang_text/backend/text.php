<?php
namespace proj\fields\multilangText;
class text extends \broccoliHtmlEditor\fieldBase{

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

		if( is_array($fieldData) ){
			if( isset($fieldData['src']) && is_string($fieldData['src']) ){
				$defaultLangSrc = ''.$fieldData['src'];
				$defaultLangSrc = htmlspecialchars( $defaultLangSrc ); // ←HTML特殊文字変換
				$defaultLangSrc = preg_replace('/\r\n|\r|\n/s', '<br />', $defaultLangSrc); // ← 改行コードは改行タグに変換
			}

			if( isset($fieldData['langs']) && is_array($fieldData['langs']) ){
				foreach( $mod->subLangs as $currentLang ){
					$currentLangSrc = '';
					if( isset($fieldData['langs'][$currentLang]) ){
						$currentLangSrc = $fieldData['langs'][$currentLang];
					}
					$subLangsSrc[$currentLang] = ''.$currentLangSrc;
					$subLangsSrc[$currentLang] = htmlspecialchars( $subLangsSrc[$currentLang] ); // ←HTML特殊文字変換
					$subLangsSrc[$currentLang] = preg_replace('/\r\n|\r|\n/s', '<br />', $subLangsSrc[$currentLang]); // ← 改行コードは改行タグに変換

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
			if( !strlen(trim($rtn)) ){
				$rtn = '<span style="color:#999;background-color:#ddd;font-size:10px;padding:0 1em;max-width:100%;overflow:hidden;white-space:nowrap;">(ダブルクリックしてテキストを編集してください)</span>';
			}else{
				$rtn = $defaultLangSrc;
			}
		}
		return $rtn;
	}

}