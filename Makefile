build:
	docker build -t bullet-hell-generator .

run:
	docker run -p 8080:80 bullet-hell-generator