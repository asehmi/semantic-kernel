import {
    Badge,
    Body1,
    Button,
    Card,
    CardHeader,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    makeStyles,
    shorthands,
    Text,
    tokens,
} from '@fluentui/react-components';
import { Dismiss12Regular } from '@fluentui/react-icons';
import { useState } from 'react';
import { Constants } from '../../../Constants';
import { IPlanInput } from '../../../libs/models/Plan';
import { CopilotChatTokens } from '../../../styles';
import { PlanStepInput } from './PlanStepInput';

const useClasses = makeStyles({
    card: {
        ...shorthands.margin('auto'),
        width: '700px',
        maxWidth: '100%',
    },
    header: {
        color: CopilotChatTokens.titleColor,
    },
    parameters: {
        ...shorthands.gap(tokens.spacingHorizontalS),
        display: 'flex',
        flexWrap: 'wrap',
    },
    bar: {
        ...shorthands.borderRadius(tokens.borderRadiusMedium),
        width: '4px',
        backgroundColor: CopilotChatTokens.titleColor,
    },
    flexRow: {
        display: 'flex',
        flexDirection: 'row',
    },
    flexColumn: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        marginLeft: tokens.spacingHorizontalS,
        marginTop: tokens.spacingVerticalXS,
        marginBottom: tokens.spacingVerticalXS,
        ...shorthands.gap(tokens.spacingHorizontalS),
    },
    singleLine: {
        ...shorthands.overflow('hidden'),
        lineHeight: '16px',
        display: '-webkit-box',
        WebkitLineClamp: 1,
        WebkitBoxOrient: 'vertical',
        width: '650px',
        fontSize: '12px',
    },
    dialog: {
        width: '398px',
        '& button': {
            marginTop: tokens.spacingVerticalL,
            width: 'max-content',
        },
    },
});

interface PlanStepCardProps {
    // See Semantic Kernel's Plan object for field definitions (step === Plan).
    // Plan.cs: https://github.com/microsoft/semantic-kernel/blob/df07fc6f28853a481dd6f47e60d39a52fc6c9967/dotnet/src/SemanticKernel/Planning/Plan.cs#
    // Not explicitly defining the type here to avoid additional overhead of property maintenance.
    step: any;
    enableEdits: boolean;
    enableStepDelete: boolean;
    onDeleteStep: (index: number) => void;
}

export const PlanStepCard: React.FC<PlanStepCardProps> = ({ step, enableEdits, enableStepDelete, onDeleteStep }) => {
    const classes = useClasses();
    const [openDialog, setOpenDialog] = useState(false);

    // Omit reserved context variable names from displayed inputs
    const inputs = step.parameters.filter(
        (parameter: IPlanInput) =>
            !(Constants.sk.reservedWords.includes(parameter.Key.trim()) || parameter.Value.trim() === ''),
    );

    return (
        <Card className={classes.card}>
            <div className={classes.flexRow}>
                <div className={classes.bar} />
                <div className={classes.flexColumn}>
                    <CardHeader
                        header={
                            <Body1>
                                <b className={classes.header}>Step {step.index + 1} •</b> {step.skill_name}.{step.name}
                                <br />
                            </Body1>
                        }
                        action={
                            enableEdits && enableStepDelete ? (
                                <Dialog open={openDialog}>
                                    <DialogTrigger disableButtonEnhancement>
                                        <Button
                                            appearance="transparent"
                                            icon={<Dismiss12Regular />}
                                            aria-label="Delete step"
                                            onClick={() => {
                                                setOpenDialog(true);
                                            }}
                                        />
                                    </DialogTrigger>
                                    <DialogSurface className={classes.dialog}>
                                        <DialogBody>
                                            <DialogTitle>Are you sure you want to delete this step?</DialogTitle>
                                            <DialogContent>
                                                Deleting this step could disrupt the plan's initial logic and cause
                                                errors in subsequent steps. Make sure the next steps don't depend on
                                                this step's outputs.
                                            </DialogContent>
                                            <DialogActions>
                                                <DialogTrigger disableButtonEnhancement>
                                                    <Button
                                                        appearance="secondary"
                                                        onClick={() => {
                                                            setOpenDialog(false);
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </DialogTrigger>
                                                <Button
                                                    appearance="primary"
                                                    onClick={() => {
                                                        setOpenDialog(false);
                                                        onDeleteStep(step.index);
                                                    }}
                                                >
                                                    Yes, Delete Step
                                                </Button>
                                            </DialogActions>
                                        </DialogBody>
                                    </DialogSurface>
                                </Dialog>
                            ) : undefined
                        }
                    />
                    {step.description && (
                        <div className={classes.singleLine}>
                            <Text weight="semibold">About: </Text> <Text>{step.description}</Text>
                        </div>
                    )}
                    {inputs.length > 0 && (
                        <div className={classes.parameters}>
                            <Text weight="semibold">Inputs: </Text>
                            {inputs.map((input: IPlanInput) => {
                                const onEditInput = (newValue: string) => {
                                    const inputIndex = step.parameters.findIndex(
                                        (element: IPlanInput) => element.Key === input.Key,
                                    );
                                    step.parameters[inputIndex] = {
                                        Key: input.Key,
                                        Value: newValue,
                                    };
                                };
                                return (
                                    <PlanStepInput
                                        input={input}
                                        key={input.Key}
                                        onEdit={onEditInput}
                                        enableEdits={enableEdits}
                                    />
                                );
                            })}
                        </div>
                    )}
                    {step.outputs.length > 0 && (
                        <div className={classes.parameters}>
                            <Text weight="semibold">Outputs: </Text>
                            {step.outputs.map((output: string) => {
                                return (
                                    <Badge color="informative" shape="rounded" appearance="tint" key={output}>
                                        {output}
                                    </Badge>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};
