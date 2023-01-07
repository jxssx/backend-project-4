lint:
	npx eslint .
dependency:
	npm ci
test:
	npm test
test_coverage:
	npm test -s -- --coverage --coverageProvider=v8
