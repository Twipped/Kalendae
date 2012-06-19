UGLIFYJS=$(shell which uglifyjs)

kal=src/main.js \
	src/util.js \
	src/auto.js \
	src/input.js \
	src/MinPubSub.js \
	src/moment.js \
	src/moment.ext.js \
	src/jq.js

all: build/kalendae.js

clean:
	rm -f build/*.js

minified: build/kalendae.min.js

minified-test: build/kalendae.min.errors


build/kalendae.js: $(kal)
	cat src/header.js > $@
	echo "(function (undefined) {" >> $@
	echo "" >> $@
	cat $(kal) >> $@
	echo "" >> $@
	echo "})();" >> $@

build/kalendae.min.js: build/kalendae.js
ifneq ($(UGLIFYJS), "")
	$(UGLIFYJS) build/kalendae.js >> $@
else
	cat src/header.js > $@
	curl -s \
		--data-urlencode 'js_code@build/kalendae.js' \
		--data-urlencode 'output_format=text' \
		--data-urlencode 'output_info=compiled_code' \
		http://closure-compiler.appspot.com/compile \
		>> $@
endif
	gzip -c build/kalendae.min.js | wc -c


build/kalendae.min.errors: build/kalendae.js
ifneq ($(UGLIFYJS), "")
	$(UGLIFYJS) build/kalendae.js 1>/dev/null
else
	curl -s \
		--data-urlencode 'js_code@build/kalendae.js' \
		--data-urlencode 'output_format=text' \
		--data-urlencode 'output_info=errors' \
		http://closure-compiler.appspot.com/compile
endif
