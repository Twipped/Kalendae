kal=src/main.js \
	src/util.js \
	src/auto.js \
	src/input.js \
	src/MinPubSub.js \
	src/moment.js \
	src/moment.ext.js \
	src/jq.js

kmomentless=src/main.js \
	src/util.js \
	src/auto.js \
	src/input.js \
	src/MinPubSub.js \
	src/moment.ext.js \
	src/jq.js

all: build/kalendae.js build/kalendae.standalone.js

clean:
	rm -f build/*.js

minified: build/kalendae.min.js build/kalendae.standalone.min.js

minified-test: build/kalendae.min.errors

build/kalendae.standalone.js: $(kal) src/header.js
	cat src/header.js > $@
	echo "(function (undefined) {" >> $@
	echo "" >> $@
	cat $(kal) >> $@
	echo "" >> $@
	echo "})();" >> $@

build/kalendae.js: $(kmomentless) src/header.js
	cat src/header.js > $@
	echo "(function (undefined) {" >> $@
	echo "" >> $@
	cat $(kmomentless) >> $@
	echo "" >> $@
	echo "})();" >> $@

build/kalendae.min.js: build/kalendae.js
	cat src/header.js > $@
	curl -s \
		--data-urlencode 'js_code@build/kalendae.js' \
		--data-urlencode 'output_format=text' \
		--data-urlencode 'output_info=compiled_code' \
		http://closure-compiler.appspot.com/compile \
		>> $@
	gzip -c build/kalendae.min.js | wc -c

build/kalendae.standalone.min.js: build/kalendae.standalone.js
	cat src/header.js > $@
	curl -s \
		--data-urlencode 'js_code@build/kalendae.standalone.js' \
		--data-urlencode 'output_format=text' \
		--data-urlencode 'output_info=compiled_code' \
		http://closure-compiler.appspot.com/compile \
		>> $@
	gzip -c build/kalendae.standalone.min.js | wc -c


build/kalendae.min.errors: build/kalendae.js
	curl -s \
		--data-urlencode 'js_code@build/kalendae.js' \
		--data-urlencode 'output_format=text' \
		--data-urlencode 'output_info=errors' \
		http://closure-compiler.appspot.com/compile
