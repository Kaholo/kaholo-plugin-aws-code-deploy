# kaholo-plugin-AWS-Code-Deploy
Kaholo plugin for integration with AWS Code Deploy API.

##  Settings
1. Access key (String) **Required if not in Method** - The default Access Key ID to use to authenticate to AWS.
    [Learn More](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey)
2. Secret key (Vault) **Required if not in Method** - The default Secret Key to use to authenticate to AWS.
    [Learn More](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey)
3. Region (String) **Required if not in Method** - The default AWS region to make requests on.
    [Learn More](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html)

## Method: Create EC2 Application
Create a new CodeDeploy application of type On-Premises (EC2).

## Parameters
1. Access key (String) **Required if not in settings** - The Access Key to use to authenticate to AWS for this request.
    [Learn More](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey)
2. Secret key (Vault) **Required if not in settings** - The Secret Key to use to authenticate to AWS for this request.
    [Learn More](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey)
3. Region (Autocomplete) **Required if not in settings** - The AWS region to make this request on.
    [Learn More](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html)
4. Name (String) **Required** - The name of the application. This name must be unique with the applicable IAM user or AWS account.
    [Learn More](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CodeDeploy.html#createApplication-property)
5. Tags (Text) **Optional** - If specified, tag the application with the tags specified. Each tag should either be in the format of ```Key=Value``` or just ```Key```. To enter multiple values separate each with a new line. 
Also accepts getting an array of objects in the form of ```{ Key, Value }``` or ```{ Key }```.
    

## Method: Create In-place Deployment Group
Create a new deployment group of type 'In-Place'.

## Parameters
1. Access key (String) **Required if not in settings** - The Access Key to use to authenticate to AWS for this request.
    [Learn More](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey)
2. Secret key (Vault) **Required if not in settings** - The Secret Key to use to authenticate to AWS for this request.
    [Learn More](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey)
3. Region (Autocomplete) **Required if not in settings** - The AWS region to make this request on.
    [Learn More](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html)
4. Application (Autocomplete) **Required** - The AWS CodeDeploy application to store the deployment group on.
    [Learn More](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CodeDeploy.html#createDeploymentConfig-property)
5. Name (String) **Required** - The name to give to the new deployment group.
    [Learn More](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CodeDeploy.html#createDeploymentConfig-property)
6. Service Role (Autocomplete) **Required** - A service role that allows AWS CodeDeploy to act on the user's behalf when interacting with AWS services.
    [Learn More](https://docs.aws.amazon.com/codedeploy/latest/userguide/getting-started-create-service-role.html)
7. Environment Auto Scaling Groups (Autocomplete) **Optional** - A list of associated Amazon EC2 Auto Scaling groups. You can select up to 10 Amazon EC2 Auto Scaling groups to deploy your application revision to. To enter multiple groups, provide an array of their IDs from code.
    [Learn More](https://docs.aws.amazon.com/codedeploy/latest/userguide/integrations-aws-auto-scaling.html)
8. Environment EC2 Instances Tag Filters (Text) **Optional** - The Amazon EC2 tags on which to filter. The deployment group includes EC2 instances with any of the specified tags.
    [Learn More](https://docs.aws.amazon.com/codedeploy/latest/userguide/instances-tagging.html)
9. Environment On-premises Instances Tag Filters (Text) **Optional** - The on-premises instance tags on which to filter. The deployment group includes on-premises instances with any of the specified tags. Can only be provided for 'In-place' deployments type.
    [Learn More](https://docs.aws.amazon.com/codedeploy/latest/userguide/instances-tagging.html)
10. Deployment Configuration (Autocomplete) **Optional** - Choose from a list of default and custom deployment configurations. A deployment configuration is a set of rules that determines how fast an application is deployed and the success or failure conditions for a deployment.
    [Learn More](https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations.html)
11. Load Balancing (Options) **Optional** - Choose whether to enable load balancing and if so the type of load balancer to use. Possible values: **None | Classic | Application/Network**
    [Learn More](https://docs.aws.amazon.com/codedeploy/latest/userguide/integrations-aws-elastic-load-balancing.html)
12. Classic Load Balancer (Autocomplete) **Required for classic load balancer** - Use the specified load balancer(s) for load balancing in a deployment. Only for 'Classic' Load Balancing.
    [Learn More](https://docs.aws.amazon.com/codedeploy/latest/userguide/integrations-aws-elastic-load-balancing.html)
13. Application Load Balancer Target Group (Autocomplete) **Required for application load balancer** - Use the specified target group to select application/network load balancer to use in deployment. Only for Application/Network Load Balancing. 
    [Learn More](https://docs.aws.amazon.com/codedeploy/latest/userguide/integrations-aws-elastic-load-balancing.html)

## Method: Create EC2 Deployment Config
Create a new deployment configuration for On-Premises (EC2) applications.

## Parameters
1. Access key (String) **Required if not in settings** - The Access Key to use to authenticate to AWS for this request.
    [Learn More](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey)
2. Secret key (Vault) **Required if not in settings** - The Secret Key to use to authenticate to AWS for this request.
    [Learn More](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey)
3. Region (Autocomplete) **Required if not in settings** - The AWS region to make this request on.
    [Learn More](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html)
4. Name (String) **Required** - Deployment configuration name. Up to 100 chars.
    [Learn More](https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations.html)
5. Minimum Healthy Hosts By Number (String) **Required if not specified by percentage** - Specify the minimum number of healthy Amazon EC2 instances that must be available at any time during the deployment.
    [Learn More](https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations.html)
6. Minimum Healthy Hosts By Percentage (String) **Required if not specified by number** - Specify the minimum percentage of healthy Amazon EC2 instances out of all the ones provided, that must be available at any time during the deployment. Expects an integer between 1-99.
    [Learn More](https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations.html)

## Method: List Applications
List all applications of the connected IAM user.

## Parameters
1. Access key (String) **Required if not in settings** - The Access Key to use to authenticate to AWS for this request.
    [Learn More](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey)
2. Secret key (Vault) **Required if not in settings** - The Secret Key to use to authenticate to AWS for this request.
    [Learn More](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey)
3. Region (Autocomplete) **Required if not in settings** - The AWS region to make this request on.
    [Learn More](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html)

## Method: List EC2 Deployments Configurations
List Deployments Configurations of the connected user for application of type On-Premises (EC2).

## Parameters
1. Access key (String) **Required if not in settings** - The Access Key to use to authenticate to AWS for this request.
    [Learn More](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey)
2. Secret key (Vault) **Required if not in settings** - The Secret Key to use to authenticate to AWS for this request.
    [Learn More](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey)
3. Region (Autocomplete) **Required if not in settings** - The AWS region to make this request on.
    [Learn More](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html)

