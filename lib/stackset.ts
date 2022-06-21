// import * as cdk from 'aws-cdk-lib';
// import { aws_cloudformation as cloudformation } from 'aws-cdk-lib';
// import * as s3 from 'aws-cdk-lib/aws-s3';
// import * as kms from 'aws-cdk-lib/aws-kms';
import * as iam from 'aws-cdk-lib/aws-iam';
import { App, CfnStackSet, Stack, StackProps } from 'aws-cdk-lib';

import * as fs from 'fs'
import * as path from 'path'
import { Role } from 'aws-cdk-lib/aws-iam';

export interface ArchiveProps extends StackProps {
    prefix: string
    replications: string[]
}
// 
const templateReplicationFile = path.resolve(__dirname, '../template/replication.yml')
const templateReplicationData = fs.readFileSync(templateReplicationFile).toString()

//export a class that extends cdk.Stack
export class TestStack extends Stack {
    constructor(scope: App, id: string, props: ArchiveProps) {
        super(scope, id, props);

        const stackSetAdminRole = new iam.Role(this, 'configRole', {
            roleName: 'AWSCloudFormationStackSetAdministrationRole',
            assumedBy: new iam.ServicePrincipal('cloudformation.amazonaws.com'),
        })
        
        const stackSetExecutionRole = new iam.Role(this, 'executionRole', {
            roleName: 'AWSCloudFormationStackSetExecutionRole',
            assumedBy:new iam.AccountPrincipal(this.account),
        })

        //  const role = new iam.Role(this, 'ReplicationRole', {
        //     assumedBy: new iam.ServicePrincipal('s3.amazonaws.com'),
        //     path: '/service-role/'
        // });

        
        stackSetAdminRole.attachInlinePolicy(
            new iam.Policy(this, 'configPolicy', {
                statements: [
                    new iam.PolicyStatement({
                  actions: ['sts:AssumeRole'],
                  resources: ['arn:*:iam::*:role/AWSCloudFormationStackSetExecutionRole'],
                }),
            ],
        }),
        );
        
        stackSetExecutionRole.attachInlinePolicy(
            new iam.Policy(this, 'executionPolicy', {
                statements: [
                    new iam.PolicyStatement({
                        actions: [
                            'cloudformation:*',
                            's3:*',
                            'sns:*',
                        ],
                        resources: [
                            '*',
                        ],
                    }),
                ],
            }),
          );
      
        //   role.addToPolicy(
        //       new iam.PolicyStatement({
        //           resources: [
        //               '*'
        //             ],
        //             actions: [
        //         'cloudformation:*',
        //         'sns:*'
        //       ]
        //     })
        //   );
      
        //   role.addToPolicy(
        //     new iam.PolicyStatement({
        //       resources: props.replications.map(
        //         region => `arn:aws:s3:::${props.prefix}-archive-replication-${region}/*`
        //       ),
        //       actions: [
        //         's3:ReplicateDelete',
        //         's3:ReplicateObject',
        //         's3:ReplicateTags'
        //       ]
        //     })
        //   );
      
        //   role.addToPolicy(
        //     new iam.PolicyStatement({
        //       resources: props.replications.map(
        //         region => `arn:aws:s3:::${props.prefix}-archive-replication-${region}`
        //       ),
        //       actions: [
        //         's3:List*',
        //         's3:GetBucketVersioning',
        //         's3:PutBucketVersioning'
        //       ]
        //     })
        //   );

        const cfnStackSet = new CfnStackSet(this, "StackSet", {
            stackSetName: `${props.prefix}-archive-replication`,
            permissionModel: "SELF_MANAGED",
            parameters: [
                { parameterKey: 'loggingRegion', parameterValue: this.region },
              ],
            // administrationRoleArn: stackSetAdminRole.roleArn,
            // parameters: [
            //   {
            //     parameterKey: 'Prefix',
            //     parameterValue: props.prefix
            //   },
            //   {
            //     parameterKey: 'ReplicationRole',
            //     parameterValue: role.roleArn
            //   }
            // ],
            stackInstancesGroup: [
              {
                regions: ['us-east-2', 'us-west-2'],
                deploymentTargets: {
                  accounts: [this.account],
                },
              },
            ],
            templateBody:`
            Parameters:
              loggingRegion:
                Type: String
            Resources:
              Topic:
                Type: AWS::SNS::Topic
                Properties:
                  TopicName: !Sub events-to-\${loggingRegion}
          `,
    });
    cfnStackSet.node.addDependency(stackSetAdminRole);
    cfnStackSet.node.addDependency(stackSetExecutionRole);
    }
}