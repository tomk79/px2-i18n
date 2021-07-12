<?php
namespace proj\fields\multilangSummernote;
class summernote extends \broccoliHtmlEditor\fieldBase{

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

				switch( $fieldData['editor'] ){
					case 'text':
						$defaultLangSrc = htmlspecialchars( $defaultLangSrc ); // ←HTML特殊文字変換
						$defaultLangSrc = preg_replace('/\r\n|\r|\n/s', '<br />', $defaultLangSrc); // ← 改行コードは改行タグに変換
						break;
					case 'markdown':
						$defaultLangSrc = $this->broccoli->markdown($defaultLangSrc);
						break;
					case 'html':
					default:
						break;
				}
			}

			if( isset($fieldData['langs']) && is_array($fieldData['langs']) && isset($mod->subLangs) && is_array($mod->subLangs) ){
				foreach( $mod->subLangs as $currentLang ){
					$currentLangSrc = '';
					if( isset($fieldData['langs'][$currentLang]) ){
						$currentLangSrc = $fieldData['langs'][$currentLang];
					}
					$subLangsSrc[$currentLang] = ''.$currentLangSrc;

					switch( $fieldData['editor'] ){
						case 'text':
							$subLangsSrc[$currentLang] = htmlspecialchars( $subLangsSrc[$currentLang] ); // ←HTML特殊文字変換
							$subLangsSrc[$currentLang] = preg_replace('/\r\n|\r|\n/s', '<br />', $subLangsSrc[$currentLang]); // ← 改行コードは改行タグに変換
							break;
						case 'markdown':
							$subLangsSrc[$currentLang] = $this->broccoli->markdown($subLangsSrc[$currentLang]);
							break;
						case 'html':
						default:
							break;
					}
				}
			}

		}

		foreach( $subLangsSrc as $lang=>$langSrc ){
			if( strlen($rtn) ){
				$rtn .= '<?php }else';
			}else{
				$rtn .= '<?php ';
			}
			$rtn .= 'if( $px->lang() == '.var_export($lang, true).' && '.var_export(strlen($langSrc), true).' && '.var_export($langSrc!='<p><br></p>', true).' ){ ?>';
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