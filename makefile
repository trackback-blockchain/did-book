export REGION						:= ap-southeast-2
export ECR_REPO_URL					:= 533545012068.dkr.ecr.ap-southeast-2.amazonaws.com
export BRANCH_NAME					:=$(shell git branch --show-current)
export IP_WEB					:=$(shell cd terraform/ap-southeast-2 && terraform output -json | jq .info.value.aws_ins_ip )


local:
	docker-compose -f docker-compose-local.yaml up --build --force-recreate --remove-orphans -d

local-down:
	docker-compose -f docker-compose-local.yaml down

run: ecr-login 
	docker-compose up --build --force-recreate --remove-orphans -d

redeploy: clean run

ecr-login:
	aws ecr get-login-password \
    --region ${REGION} \
	| docker login \
		--username AWS \
		--password-stdin ${ECR_REPO_URL}

ecr: ecr-login
	-aws ecr create-repository --repository-name did-book > /dev/null

build:
	docker build -f ./Dockerfile --no-cache -t did-book:latest .
	docker tag did-book:latest $(ECR_REPO_URL)/did-book:latest
	docker push $(ECR_REPO_URL)/did-book:latest

down:
	docker-compose -f ./docker-compose-local.yml stop -t 1

clean:
	docker-compose stop -t 1
	docker-compose rm -f
	docker rmi -f $(shell docker images -q)

destroy:
	cd terraform/ap-southeast-2 && terraform destroy -var="branch_name=$(BRANCH_NAME)" --auto-approve 

deploy: destroy
	cd terraform/ap-southeast-2 && terraform apply -var="branch_name=$(BRANCH_NAME)" --auto-approve

remotedeploy: ecr-login build
	ssh -i ~/.ssh/ec2_key.pem ubuntu@$(IP_WEB) -t 'cd repo && make redeploy'