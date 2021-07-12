$(window).on('load', function(){

	(function(){
		var $langSelector = $('.theme-lang-selector');
		var currentLang,
			defaultLang,
			acceptLangs;

		currentLang = $langSelector.attr('data-current-lang');
		defaultLang = $langSelector.attr('data-default-lang');
		acceptLangs = JSON.parse($langSelector.attr('data-accept-langs'));

		var $select = $('<select>');
		$select.append( $('<option>').attr({'value':defaultLang}).text(defaultLang) );
		for( var idx = 0; idx < acceptLangs.length; idx ++ ){
			$select.append( $('<option>').attr({'value':acceptLangs[idx]}).text(acceptLangs[idx]) );
		}
		$select.val(currentLang);

		$langSelector.append($select);
		$select.on('change', function(){
			var $this = $(this);
			var selectedVale = $this.val();
			var tmpPathParts = location.pathname.split( currentLang );
			if( tmpPathParts.length >= 2 ){
				if( defaultLang == selectedVale ){
					location.href = tmpPathParts[1];
				}else{
					location.href = tmpPathParts.join(selectedVale);
				}
			}else{
				if( defaultLang == selectedVale ){
					location.href = location.pathname;
				}else{
					location.href = '/'+selectedVale+location.pathname;
				}
			}
		});
	})();
});
